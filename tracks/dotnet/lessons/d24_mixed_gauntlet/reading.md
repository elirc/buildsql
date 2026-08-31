# Reading - dotnet/d24_mixed_gauntlet

## Notes

This is the gauntlet, so there is no new idea in it. What is new is the
*combination*: real handlers do not practise one topic at a time, and the
mistakes that survive code review are almost always the seam between two of
them - a route that validates, a filter that runs after the query instead of
inside it, a limit that is a constant instead of a setting, a log line that
reads well and cannot be queried.

Three habits carry all eight problems.

**Push the decision as far out as it will go.** Routing can answer "that is not
an id" without a handler. A policy can answer "not a curator" without a
database. A query can answer "not yours" without loading a row. Every decision
made one layer too late is a decision that can be forgotten one refactor later.

**Say the same thing to the machine and to the human.** Problem details do this
with `type` (what a client branches on) and `detail` (what a person reads);
structured logging does it with a message template, which produces the sentence
and the named fields from one line of code. Both fail the same way: an
interpolated string, or a status code with no stable identity behind it.

**Refusals are a design surface.** 400 means the payload is wrong, 404 means
there is nothing there *or* nothing you may know about, 409 means the payload
is fine and the world says no. The difference between 403 and 404 is the
difference between confirming a resource exists and refusing to.

## ex1

What this was really testing: that routing is a matching stage with its own
answers, not a prelude to parsing. A literal segment outranks a parameter
segment regardless of the order they were registered in, and a route constraint
like `:int` removes non-matching requests from consideration entirely.

The classic mistake is the shipped stub: one `{id}` route, `int.TryParse` at the
top of the handler, and a 400 for `abc`. That 400 is a lie - the caller did not
send a malformed exhibit id, they asked for a URL that does not exist - and the
same shape swallows `/open` as an id too.

The model answer registers two routes and lets the router choose, so each
handler receives exactly the shape it declared and can spend its whole body on
the one thing it is for.

## ex2

What this was really testing: that a lifetime is a claim about a boundary, and
that transient has no boundary at all. `ID24Visit` must be the same object
everywhere inside one request and a new object in the next; `ID24Turnstile` must
outlive every request the process handles.

The classic mistake is registering both as transient because it "works" -
nothing throws, the endpoint returns 200, and the two bugs only show up as a
per-request id that changes inside the request and a counter that is always 1.

The model answer is two words: `AddScoped` for the thing whose boundary is the
request, `AddSingleton` for the thing that must survive it - and the reverse
mistake, a scoped counter or a singleton holding request state, is the one that
leaks one user's data into another user's response.

## ex3

What this was really testing: two habits that always travel together - a limit
that lives in configuration, and validation that reports every failure at once.
`IOptions<D24Options>` resolves whether or not anything bound to it, so the
class default is the value in force until an operator sets the key.

The classic mistake is the hard-coded `4`. It passes every test written against
the default, and the day somebody sets `Dojo:D24:MaxTicketsPerVisitor` nothing
changes and nobody can see why. The second mistake is returning on the first
failure, which turns one bad payload into a sequence of round trips.

The model answer reads the limit once into a local, collects failures into a
dictionary, and returns a `ValidationProblem` only when that dictionary is
non-empty - so a well-formed payload against a missing exhibit can be the 404 it
really is.

## ex4

What this was really testing: whether the shape of the answer is being computed
by the database or by a `foreach`. The response body is identical either way,
which is precisely why an N+1 loop survives review; the cost only appears in the
query count and it grows with the data.

The classic mistake has two halves, and the stub commits both: one query per
exhibit, and counting *every* ticket as sold because the `Cancelled` filter was
never written into the query.

The model answer groups in the database twice - exhibits by gallery, live
tickets by their exhibit's gallery - and joins the two small results in memory,
which is a fixed two round trips no matter how many exhibits exist.

## ex5

What this was really testing: that a write has three outcomes and each one owes
the caller a different, machine-readable answer. 201 says a new thing exists and
`Location` says where; 404 and 409 are both refusals and they mean different
things.

The classic mistake is answering 400 for a full exhibit. Nothing the client sent
is malformed - the request was valid and the world changed - and a client that
retries on 409 but gives up on 400 will do the wrong thing. The other classic is
a bare `NotFound()` with no body, which tells an automated caller nothing.

The model answer counts only non-cancelled tickets, returns `seatsLeft` as an
extension member so the client does not have to ask again, and saves before
building the `TicketDto` so the id in the body is the id in the database.

## ex6

What this was really testing: that the token is the only trustworthy answer to
"who is asking", and that a log line is data rather than prose. The scheme sets
`NameClaimType` to `sub`, so `user.Identity.Name` *is* the token subject.

The classic mistake is the pair in the stub: a query with no `Where` (so every
caller reads every ticket) and `logger.LogInformation($"...")`, which renders
the string before the logger ever sees it and produces an entry with no named
properties at all.

The model answer puts `curator || t.Holder == holder` inside the query, so the
rows that are not yours never travel, and logs with a template so `Count` and
`Holder` are indexable fields as well as a readable sentence.

## ex7

What this was really testing: that a refusal can leak. If "somebody else's
ticket" answers 403 and "no such ticket" answers 404, the difference between the
two is an oracle, and an attacker can walk the id space and map the database
using nothing else.

The classic mistake is writing the two checks as two branches with two answers,
which feels more honest and is exactly the leak. The second is treating the log
level as a function of the status code - both the 404 and the 409 are refusals,
and only one of them is worth anybody's attention.

The model answer collapses "missing" and "not yours" into one `if` with one
`NotFound()`, logs it at `Information` because a caller asking for the wrong
ticket is a Tuesday, and reserves `Warning` for the already-cancelled conflict,
which is somebody repeating work that was already done.

## ex8

What this was really testing: ordering. Every check in this handler is cheap or
expensive, and safe or unsafe to reveal, and the order they run in is the whole
design - policy first (no database touched), then payload validation (no
database touched), then existence, then capacity, then the write.

The classic mistakes are all seams: saving inside the loop, so a half-written
booking becomes a possible state with no request that can finish it; checking
capacity before validating the payload, so a garbage `count` reaches the
database; and logging without the trace identifier, which leaves a pile of
sentences nobody can join to the request a support ticket is about.

The model answer builds every `Ticket` in memory, calls `SaveChangesAsync`
exactly once so the booking is all-or-nothing, reads the ids back after the save
because the database assigns them, and emits one entry carrying `Count` and
`TraceId`.

## Further reading

- [Routing in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing) - literal against parameter segments, route constraints, and precedence.
- [Dependency injection in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection) - transient, scoped and singleton, and the captive dependency trap.
- [Options pattern in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options) - `IOptions<T>`, binding a section, and defaults that survive.
- [Efficient querying in EF Core](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) - projections, grouping, and how N+1 happens.
- [Handle errors in ASP.NET Core APIs](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors) - problem details, extension members, and `type`.
- [Logging in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging) - message templates, named properties, and choosing a level.
- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) - requirements, roles, and 401 against 403.
- [RFC 9457 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457) - the members, and what `type` is for.
