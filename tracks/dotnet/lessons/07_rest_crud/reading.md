# Reading - dotnet/07_rest_crud

Nothing in this lesson is technically difficult. All of it is *decisions* — what
leaves your process, what is allowed in, and which of six status codes tells the
truth. That is what makes it the lesson most like real work.

## Notes

**REST, briefly and honestly.** The parts of REST that pay for themselves are:
resources identified by URLs, a uniform interface (the HTTP methods mean what
the spec says they mean), stateless requests, and self-descriptive messages
(status codes, content types, `Location`). The part almost nobody implements is
HATEOAS — responses carrying links to the next possible actions — and you should
know it exists and that its absence is why purists say most "REST APIs" are not.
None of that stops the useful 90% from being useful.

**Safe, idempotent, neither.** `GET` and `HEAD` are *safe*: they must not change
anything, which is why a browser or a crawler may issue them freely. `GET`,
`PUT` and `DELETE` are *idempotent*: doing them twice leaves the same state as
doing them once. `POST` is neither. These are not stylistic preferences —
retry policies, proxies and CDNs act on them. An endpoint that charges a card on
`GET` will eventually charge someone twice because a link preview fetched it.

**Making POST idempotent.** The standard technique is an `Idempotency-Key`
header the client generates: the server stores the key with the result of the
first request, and returns that stored result for any repeat. Stripe's API is
the canonical example. Being able to describe this is a good answer to "how would
you stop a double-charge on a flaky network".

**ProblemDetails is RFC 9457.** `type`, `title`, `status`, `detail`, `instance`,
plus any extension members you add. ASP.NET Core produces it from
`Results.Problem` and `Results.ValidationProblem`, and
`builder.Services.AddProblemDetails()` makes the framework use it for status
codes it generates itself (404s from routing, 415s from binding) rather than
returning an empty body. Lesson 08 turns unhandled exceptions into it too.

**Where validation can live.** Four options, roughly in order of ceremony:
hand-written `if`s in the handler (what you just did — explicit, no magic,
fine for a handful of rules); data annotations on the DTO plus a small filter;
an endpoint filter that validates any DTO implementing a marker interface; or
FluentValidation, which most large .NET codebases end up using. The important
part is that whatever you choose produces *one* 400 listing *all* the problems.

**Status codes people get wrong.** 401 versus 403 (lesson 09). 400 versus 422 —
400 for "I could not parse or bind this", 422 for "every field parsed and the
combination is invalid"; teams differ, and consistency matters more than which
side you pick. 404 versus 403 for a resource you are not allowed to see — 404
leaks less, and is the right default for anything where the existence of the id
is itself information. And 200-with-an-error-object-inside, which is not a
status code so much as a decision to opt out of HTTP.

## ex1 - the DTO is a boundary, not boilerplate

The argument against DTOs is that they are duplication: `WidgetDto` has four of
`Widget`'s six properties and a mapping line for each. The argument for them is
everything that duplication buys.

**They stop leaks.** `InternalNotes` is in the table because operations needs it.
Serialise the entity and it is in your public API — and once a client has seen a
field, removing it is a breaking change. This is the mechanism behind a
depressing number of real data exposures: not a bug in access control, just an
ORM object handed to a serialiser.

**They decouple your schema from your contract.** Rename a column, split a table,
add a computed field — with a DTO in between, those are internal changes. Without
one, your database schema *is* your published API, and every migration is a
client-visible change.

**They stop over-fetching.** Because the DTO is what the query projects into, the
SQL only reads four columns. Entity in, entity out means every list endpoint
selects every column of every row.

The cost is real and the answer is not AutoMapper. Hand-written projections are
a line each, they are greppable, they show up in the SQL, and they never
silently map a field you did not mean to map. Most teams that adopted
convention-based mapping to save those lines have since spent longer debugging
the mappings than they saved.

## ex2 - 400 and 409 are different questions

The distinction is worth being able to state crisply, because interviewers ask
it and because getting it wrong makes an API confusing.

**400** means: *look at your request; it is wrong on its face.* A blank name is
400 no matter what is in the database. The client can fix it without knowing
anything about server state, and retrying the identical request will always
fail.

**409** means: *your request is fine; the world is not in a state where I can do
it.* A duplicate sku is only knowable by consulting the collection. The client
could not have prevented it, the same request might succeed tomorrow, and the
right client behaviour is different — refetch, show the conflict, maybe merge.

The same logic covers the illegal state transition from lesson 01's challenge and
optimistic-concurrency failures (`If-Match` didn't match). If the answer depends
on state, it is 409.

Collecting all the errors before returning is the other half of this exercise,
and the reason is empathy for the caller. Fail-fast validation gives a form that
reports one field error at a time; users experience it as the software toying
with them.

## ex3 - idempotency, and mass assignment

**Idempotency** is a property of the *end state*, not of the response.
`PUT /widgets/2` with the same body twice must leave the row identical, and the
second call is still a success — because the client's intent ("make this URL hold
this representation") is already satisfied. Answering 409 the second time would
break every retry-on-timeout policy that exists, and a timeout is exactly the
case where a client does not know whether the first call landed.

This is also why `PUT` takes the *whole* representation. A partial `PUT` is not
idempotent in any useful sense, because the result depends on what was there
before. Partial updates are `PATCH`, and `PATCH` has its own formats
(JSON Patch, JSON Merge Patch) precisely because "just send the fields you want
to change" is ambiguous about nulls.

**Mass assignment** is the security half. The vulnerable version looks like
convenience:

```csharp
var widget = mapper.Map<Widget>(request);   // or JsonSerializer straight onto the entity
db.Widgets.Update(widget);
```

Whatever the client sent that happens to match a property gets written, including
properties added by a colleague six months later. The safe version is the boring
one you wrote: fetch the row, assign the three fields you accept, save. The
change tracker writes only what changed, `InternalNotes` is never mentioned, and
adding a column to the entity cannot open a hole.

If the phrase does not stick, the canonical anecdote will: in 2012 someone added
themselves as a committer to the Rails repository on GitHub by including an
extra field in a form post.

## ex4 - what "gone" means, and soft deletes

This API's DELETE is 204 the first time and 404 afterwards, which treats the
result as a statement about *this request* rather than about the end state. The
alternative — 204 every time, because "not there" is what you asked for — is
equally defensible and slightly friendlier to retries. Pick one, write it in
your docs, and be consistent across resources; the failure mode is an API where
`/widgets` and `/orders` disagree.

What real systems usually do instead is not delete at all. A `DeletedAt`
timestamp plus a global query filter (`modelBuilder.Entity<Widget>().HasQueryFilter(w => w.DeletedAt == null)`)
gives you a **soft delete**: the row survives for audit, referential integrity
and undo, and every query pretends it is gone. The API still answers 204 and 404
exactly as yours does — the client cannot tell, which is the point. The costs are
that unique indexes need care (a deleted sku still occupies it) and that "delete
my data" regulations mean you need a real deletion path anyway.

## challenge - the boring endpoint that everything depends on

List endpoints are where APIs are actually used, and where they are usually
worst. Four things this one gets right:

**A default page size.** An endpoint that returns everything by default is fine
until the table grows, and then it is an outage with no code change to blame.

**A maximum page size, enforced with a 400.** Silently clamping 1000 to 50 means
a client that thinks it read everything has read 5%, and will not find out.

**A whitelist of sort values.** `sort` is a string from a caller that becomes
part of a query. A whitelist is not paranoia about SQL injection — LINQ
parameterises — it is about not exposing your column names as API surface, and
about being able to add an index for each supported sort.

**A total count.** Two queries, and it is what makes page numbers possible. The
alternative, `size + 1` fetching to answer "is there more", is right for infinite
scroll and cheaper; both are normal.

The `X-Total-Count` header rather than a wrapper object is a style choice — it
keeps the body a plain array, which is nice for clients that just want to
iterate. A `{"items": [...], "total": n}` envelope is equally common and slightly
easier to extend. What matters is that the total is *somewhere*.

## Further reading

- [Create responses in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses) — `TypedResults.Created`, `NoContent`, `Problem` and `ValidationProblem`.
- [Handle errors in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) — `AddProblemDetails`, the RFC 9457 shape, and status-code pages.
- [RFC 9110 §9.2 — Method properties](https://www.rfc-editor.org/rfc/rfc9110.html#name-common-method-properties) — the actual definitions of "safe" and "idempotent".
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) — the error document your 400s are speaking.
- [Global query filters in EF Core](https://learn.microsoft.com/en-us/ef/core/querying/filters) — the mechanism behind soft deletes and multi-tenancy.
