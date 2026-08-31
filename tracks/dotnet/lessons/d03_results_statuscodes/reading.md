# Reading - dotnet/d03_results_statuscodes

## Notes

A status code is the only part of your response every client understands without
reading your documentation. Proxies, caches, retry libraries, browsers and
monitoring dashboards all branch on it, which is why "200 with an error inside"
is not a style choice — it is a lie the whole ecosystem believes.

Two questions decide almost every code in this set. **Whose fault is it?** 4xx
means the caller has to change something, 5xx means you do. **What changed?**
201 says something new exists at a URL, 204 says it worked and there is nothing
to send, 409 says the request was fine and the current state refuses it.

The pattern that unites the eight problems is the same three lines every time:
validate the request, find the resource, then act — and each stage has its own
status code. Doing them in a different order gives a caller the wrong thing to
fix, which is exactly what ex4 is built to catch.

## ex1

A collection and an item fail differently, and this is the single most commonly
confused pair in REST. `/bookings?state=pending` matching nothing is a **200
with `[]`**: the collection exists, and its current contents are none. A missing
`/bookings/99` is a **404**: no such resource.

The classic mistake is a 404 for the empty list, usually written to be
"helpful". It forces every client to treat "no results" as an error path, breaks
the natural `for` loop over the response, and makes an empty filter
indistinguishable from a typo in the URL. The model answer simply never checks
whether the list is empty.

## ex2

Two things make a 201 useful, and only one of them is the status. The
`Location` header tells the client where the thing it just created now lives;
without it the client has to guess, re-fetch the collection, or parse the id out
of the body and rebuild the URL itself. Returning the created resource in the
body as well saves that round trip.

The other half of the drill is ordering: validate, then write. The gate lists
the bookings afterwards precisely because "return a 400 *after* calling
`store.Add`" passes every status-code check and corrupts the data.

## ex3

204 means *no content*, and it is a promise: there is no body, and the client
should not try to read one. Writing `{"deleted":true}` alongside a 204 is
malformed — some HTTP stacks will discard it, some will error, and none of them
will use it.

The second delete being a 404 is a deliberate choice worth being able to defend.
DELETE is meant to be idempotent, and many APIs answer 204 every time so that a
retried delete looks successful; that is defensible too, because the *end state*
is what the client asked for. Whichever you pick, pick it once and write it down,
because a client's retry logic depends on it.

## ex4

Four outcomes, and the exercise is really about the order you check them in. The
gate's `nonsenseOnMissing` case is the trap: a bad state *and* a bad id must be a
400, because you should reject a request you cannot understand before you go
looking for a resource. Answering 404 there tells the caller to fix the id when
the actual problem is the body.

409 is the code most APIs forget. The request is well formed and the resource
exists — so it is not a 400 and not a 404 — and the *current state* refuses the
transition. Anything modelled as a state machine has 409s in it: cancelled
bookings, closed accounts, already-shipped orders, stale ETags.

## ex5

400 and 422 split "I could not understand your request" from "I understood it and
it cannot be done". A blank room is a shape problem: 400. A perfectly-shaped
request naming a room that does not exist is a semantic problem: 422
Unprocessable Content.

The line is genuinely blurry — plenty of good APIs use 400 for both, and the
distinction only earns its keep when clients act on it differently (retry after
fixing the field, versus retry never). What is not optional is the *body*:
`ValidationProblem` produces an RFC 9457 document with an `errors` dictionary
keyed by field, which is a machine-readable contract, unlike a sentence.

Note that the model answer collects **all** the errors before returning. An
endpoint that fails on the first problem makes the client play twenty questions.

## ex6

`TypedResults.Json`, `Text`, `Content`, `File`, `Stream` and `Bytes` are the
shape-choosing helpers, and the thing they really control is the `Content-Type`
header. `TypedResults.Text(s, "text/plain")` sends the string as-is;
`TypedResults.Ok(s)` sends it as a *JSON* string, quotes included, which is a
different document.

The 400 for `format=xml` is the judgement call. Falling back to JSON is
friendlier and worse: a client that asked for XML and silently got JSON has no
way to detect the mismatch until something downstream breaks. Real content
negotiation lives in the `Accept` header and answers **406 Not Acceptable**; a
`format` query parameter is the pragmatic version, and it should be just as
strict.

## ex7

`Results<Ok<T>, NotFound, BadRequest<string>>` puts the endpoint's possible
outcomes into its *signature*. Two things fall out. The compiler stops you
returning anything else — a fourth outcome is a build error, not a surprise in
production — and the OpenAPI document gets all three response types with their
schemas, without an attribute per code.

The classic mistake is reaching for `IResult` everywhere because it is shorter.
It is, and it buys nothing: `IResult` documents nothing and checks nothing.
Reach for the union when an endpoint has a small, fixed set of outcomes, and for
`IResult` when it genuinely does not.

## ex8

`CreatedAtRoute` is `Created` plus link generation: name the GET endpoint, and
the `Location` is produced from the route table rather than from a format string,
so the URL keeps working when the template changes. Note it emits an **absolute**
URL — both forms are legal per RFC 9110, and knowing which one you emit matters
to clients that join it against a base.

The 409 is the other half. A conflict a caller has to act on deserves a
`ProblemDetails` body: `TypedResults.Problem(detail:, statusCode:, title:)`
gives you the RFC 9457 document with a `detail` naming the collision, so the
client can show a message instead of "409". Note the detail says *what*
collided; it does not echo anything the caller could not already see, which is
the line to hold when the conflicting record belongs to someone else.

## Further reading

- [Create responses in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses) — `TypedResults`, the union return type, and every built-in result.
- [Handle errors in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) — `AddProblemDetails`, `ValidationProblem` and the RFC 9457 body.
- [RFC 9110 §15 — HTTP status codes](https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes) — what 201, 204, 409 and 422 actually promise, in the words that settle arguments.
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) — the error format ASP.NET Core emits by default.
