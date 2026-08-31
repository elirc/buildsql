# Reading - dotnet/d16_rest_writes

## Notes

A write endpoint has to answer two questions the read endpoints never faced:
what changed, and what happens when the same request arrives twice. The set
drills both, and the pattern that unites every exercise is that **the database
is the assertion**. The gates do not trust a 204; they read the rows back
afterwards, including on the failure paths, where the interesting bug lives.

The verbs, in the shape this API uses them:

- **POST** creates something the server names. It answers **201** with a
  `Location` header, because the client cannot know the id it just caused.
- **PUT** replaces a resource the client names. A field left out of the body
  goes back to its default - that is what *replace* means, and it is the one
  thing people reliably get wrong.
- **PATCH** changes only the fields that were actually sent. `null` in the
  parsed body means "not mentioned", never "set it to empty".
- **DELETE** answers **204** and nothing else.

And the failure vocabulary. **400** is "your request is malformed" - a blank
title, zero copies, a status this queue does not have. **404** is "no such
resource". **409** is the one people reach for last and should reach for more:
the request is fine and the resource exists, but its *state* refuses. **412**
and **428** are the concurrency pair from ex7.

Running through all of it: validate before you assign. EF Core tracks the
entity you loaded, so a handler that sets three properties and *then* decides
to return 400 has already staged a change; the next `SaveChanges` anywhere in
that request commits it. Decide first, mutate second.

## ex1

What this was really testing: that a create tells the client where the new
thing is. The shipped code saves correctly and answers 200 with the body, which
leaves the client parsing an id out of JSON - or, more often, refetching the
whole collection to find what it just made.

The classic mistake beyond the status is trying to build the `Location` before
`SaveChangesAsync`. The id does not exist until the insert runs; that is the
whole reason the server, not the client, is the one that names it. The model
answer's reasoning: save, then use the id EF filled in, then
`TypedResults.Created(location, dto)` - which sets the header and the body in
one call.

## ex2

What this was really testing: 204 and the difference between "gone" and "never
there". A successful delete has nothing to say, and 204 is how HTTP says
nothing - a body alongside it contradicts the status line, and some proxies
will simply drop it.

The design decision worth arguing about is the second delete. Answering 204
again is defensible: the end state the client asked for holds, and that makes
DELETE idempotent, which is what the specification wants. This API answers 404
instead, to tell the client its id is stale. Both are shipped in the wild; what
is not defensible is choosing without deciding. The README states it, so the
gate can.

## ex3

What this was really testing: replacement semantics. `PUT /d16/jobs/5` with no
`status` in the body sets the status back to `queued`, because PUT declares the
new state of the whole resource and anything absent from that declaration is
absent from the resource.

The classic mistake is keeping the old value for missing fields - PATCH
behaviour under a PUT. It feels forgiving and it makes a field impossible to
clear: the client sends a body without `status` meaning "remove it", the server
keeps the old one, and the two sides disagree forever.

The other half is the ordering. The gate ends by checking that job 1 is
untouched after three rejected requests, because the natural way to write this
handler - load, assign, validate, return 400 - has already changed the tracked
entity by the time it decides to refuse. The model answer's reasoning: compute
`title`, `copies` and `status` into locals, collect every error, and only
assign once there are none.

## ex4

What this was really testing: idempotency keys, which is how every payment API
you have used survives a mobile network. The client generates a key, sends it
with the request, and retries with the *same* key when it does not see an
answer. The server promises that the second call does not do the work again.

Three details the gate pins down. A missing key is refused outright, because an
endpoint that cannot be retried safely should not accept a request that might
be retried. The replay answers **200**, not 201 - nothing was created this time.
And the replay returns the **stored** result even though its body differs: an
idempotency key says "this is the same request I already sent", so the first
one is the one that happened. A server that applies the new payload has
implemented an upsert and called it idempotency.

The classic mistake in production is storing the key only *after* the work
succeeds, which leaves a window where two concurrent retries both find nothing
and both do the job. The real fix is a unique index on the key column, so the
second insert fails rather than duplicating - worth knowing even though this
drill is single-threaded.

## ex5

What this was really testing: that `null` in a parsed patch body carries
information - "the client did not mention this" - and that flattening it with
`??` destroys that information. The shipped handler does exactly that, and one
PATCH of `copies` wipes the title.

Every rule in the model answer is guarded twice: once by "was this field
present", and once by the same validation PUT applies. That second half is the
part people skip. `copies: 0` is invalid whether it arrives by PUT or PATCH;
the verb changes which fields are *considered*, never which values are *legal*.

The honest limitation: nullable-field patching cannot distinguish "not sent"
from "explicitly sent as null" for a genuinely nullable column. When that
distinction matters, the answer is JSON Merge Patch or JSON Patch, or a
wrapper type that records presence separately from value. For a drill of three
non-nullable fields, nullable properties are the right amount of machinery.

## ex6

What this was really testing: 409, the status that says "you are not wrong, but
no". Cancelling a job that is already `done` is not a malformed request (400
would blame the client's payload) and not a missing resource (404 would blame
the id). The job is there, the request is fine, and the state machine refuses.

The reasoning behind the specific transitions: `queued` and `printing` are
in-flight and can still be pulled; `done` and `cancelled` are terminal. Making
a re-cancel a no-op 204 would be defensible too - but this API has decided that
the client asking to cancel a finished job has a stale view worth telling it
about, which is exactly what a conflict is.

`TypedResults.Problem(statusCode: 409, ...)` is the shape: a
`ProblemDetails` body, so the client gets a machine-readable reason rather than
a bare status code and a guess.

## ex7

What this was really testing: optimistic concurrency over HTTP, which is the
same idea as ex5 of the reads drill turned around. There, the client asked "is
my copy still current?" and saved a download. Here it says "only write if my
copy is still current" and saves an overwrite.

The three statuses have distinct jobs. **428 Precondition Required** is the
server refusing to accept a blind write at all: a client that sent no `If-Match`
never read the resource, so there is no version it could have been editing, and
letting it through is last-write-wins by default. **412 Precondition Failed**
is the race actually being lost - somebody wrote between this client's read and
its write, and the correct response is to re-read and decide, not to guess which
edit mattered. **204** is the write going through, and the version moving, which
is what makes the *next* replay of the old tag fail.

The classic mistake is a version that never changes. An ETag derived from
something static is permanently valid, every `If-Match` matches, and the whole
protocol is theatre. The second classic mistake is checking the precondition
after the assignment, which fails the "nothing was written" half of the gate for
the same reason ex3 does.

Worth knowing: EF Core has this built in as `[Timestamp]` / `IsConcurrencyToken`,
which turns the check into a `WHERE Version = @old` on the UPDATE and throws
`DbUpdateConcurrencyException` when it matches no rows. That version is safe
against a race between the check and the write; the hand-rolled one in this
drill is not, and knowing why is the point.

## ex8

What this was really testing: batch semantics, which is ex3's "validate before
you assign" scaled up until it is impossible to fake. Two jobs, one of them
unusable, and the gate checks that the *valid* one was not created either.

Three disciplines stack here. All-or-nothing validation: one pass over every
item collecting every error, so a client with four bad rows learns about four
bad rows rather than bisecting its own payload over four round trips. Keyed
errors: `items[1].copies` names the item and the field, which is the difference
between a usable API and a 400 with the word "invalid" in it. And a single
write: hanging the jobs off `batch.Jobs` means one `SaveChanges` inserts the
batch and its jobs together and EF fills in each `BatchId` - two saves would
leave an orphan batch behind if the second one failed.

The last check is the quiet one: the `Location` the create handed out has to
actually resolve. A 201 pointing at a URL that 404s is a create that lied, and
it is astonishingly common in APIs where the create and the read were written by
different people in different weeks.

## Further reading

- [Create responses in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses) - `TypedResults.Created`, `NoContent`, `Problem`, `ValidationProblem`, `StatusCode`.
- [Handle errors in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/handle-errors) - the `ProblemDetails` and validation-problem shapes.
- [Saving data with EF Core](https://learn.microsoft.com/en-us/ef/core/saving/) - change tracking, `SaveChanges` as a unit of work, and related-entity inserts.
- [Handling concurrency conflicts](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) - the database-level version of ex7, and `DbUpdateConcurrencyException`.
- [RFC 9110 section 13](https://www.rfc-editor.org/rfc/rfc9110#name-conditional-requests) - `If-Match`, `If-None-Match`, 412 and what a precondition means.
- [RFC 6585 section 3](https://www.rfc-editor.org/rfc/rfc6585#section-3) - 428 Precondition Required, and why it exists.
