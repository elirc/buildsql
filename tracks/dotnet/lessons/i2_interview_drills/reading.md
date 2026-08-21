# Reading - dotnet/i2_interview_drills

Six drills, one take-home, and one review. This page is the *why* behind each —
including the parts an interviewer will push on after you have finished the code,
which is where most of the signal in a technical interview actually is.

## Notes

**What a drill is testing.** Almost never whether you can produce the code — an
interviewer knows you could look it up. What they are watching is the order you
do things in, whether you name the edge cases before you hit them, whether you
say what you are doing while you do it, and whether you know when to stop and
ask. Narrating "I'll validate first so nothing partial gets written, then do the
happy path" is worth more than five minutes of silent typing.

**Say the trade-off out loud.** Every one of these drills has one: two queries
for a total count versus fetching `size + 1`, an in-memory counter versus a
distributed one, a 404 versus a 403, an idempotency key versus a natural key.
Naming it unprompted is the single clearest signal that you have shipped
something before. Nobody expects you to have chosen the same side as the
interviewer.

**Time-boxes are a skill, not a punishment.** Deciding at minute fifteen that
you will implement the naive version and describe the good one is a legitimate,
often correct, engineering move — and interviewers respond well to it. Running
out of time silently is the failure mode.

**Reach for the framework where the framework is right.** `AddRateLimiter`,
`AddProblemDetails`, `AddAuthorizationBuilder`, `IExceptionHandler`,
`IHttpClientFactory`. In an interview, saying "in production I'd use the built-in
rate limiter with a sliding window; here's the hand-rolled fixed window so you
can see the logic" gets you both marks.

## ex1 - the search endpoint

Filter, then sort, then page — in that order, because each one narrows what the
next one sees. Sorting before filtering wastes work and, more importantly,
paging before filtering gives wrong answers: page 1 of a filtered set is not the
filtered part of page 1.

Four design decisions worth defending out loud.

**A default page size**, because an endpoint that returns everything by default
is an outage waiting for the table to grow. **A maximum page size, enforced with
a 400** rather than a silent clamp, because a client that asked for 1000 and
quietly got 20 believes it has read everything. **A whitelist of sort values**,
so your column names are not API surface and every supported sort can be
indexed. And **`X-Total-Count`**, without which a client cannot render page
numbers — with the honest caveat that it costs a second query, and that the
cheaper alternative is to fetch `size + 1` rows and report only "there is more".

The case-insensitive author match is the small usability point: an identifier a
human types should not require them to guess your capitalisation. Note that
`StringComparison.OrdinalIgnoreCase` is the right comparison for machine
identifiers; `InvariantCultureIgnoreCase` and culture-sensitive comparisons
belong to text meant for humans to read, and the difference has bitten enough
people that "which comparison and why" is itself an interview question.

## ex2 - the rate limiter

The naive fixed window you just wrote has a well-known flaw, and knowing it is
most of the value of the drill: a client can send its whole allowance at the end
of one window and its whole allowance at the start of the next, so a limit of 3
per minute permits 6 requests in two seconds. The fixes are a **sliding window**
(track timestamps, or weight the previous window) or a **token bucket** (refill
at a steady rate, allow a burst up to the bucket size). Say that sentence
unprompted and the drill is over.

The second thing an interviewer will ask is where the counter lives. An
in-process dictionary limits per instance, so ten instances behind a load
balancer means ten times the limit; the real answer is shared state — Redis,
usually — with all the latency and failure-mode questions that brings. And what
do you do when Redis is down: fail open (let traffic through, risk overload) or
fail closed (reject everything, cause an outage)? There is no right answer;
there is only having thought about it.

Two details the gate insists on because they matter in practice. **`Retry-After`**
turns "back off" into "back off for 60 seconds", which is the difference between
a client that recovers and one that hammers you. And **actually short-circuiting**
— setting 429 and then calling `next` anyway means the work you were trying to
shed still happens, which is the exact opposite of the point.

For real systems, `builder.Services.AddRateLimiter(...)` with
`AddSlidingWindowLimiter` or `AddTokenBucketLimiter` has been in ASP.NET Core
since .NET 7, integrates with endpoint metadata, and handles the queueing and
partitioning properly.

## ex3 - PUT as upsert

PUT means "make the resource at this URL be this representation". Nothing in
that says the resource has to exist first — which is why PUT-as-create is
correct whenever *the client chooses the identifier*: a settings key, a username,
a slug, an idempotency-keyed record. When the server generates the id, POST is
the only option, because the client cannot name a URL that does not exist yet.

201 versus 204 is the only interesting branch, and it is a statement about what
happened rather than about what the client asked for. Both are successes; the
201 additionally says "and something new now exists at this URL", which is why it
carries a `Location`. A client that is watching for 201 to invalidate a list
cache would be broken by an endpoint that always returned 204.

Idempotency falls out for free here, which is the tell that the design is right:
"set this key to this value" applied twice is indistinguishable from applying it
once. If making an operation idempotent requires bookkeeping, that is a hint the
operation is really a POST wearing a PUT's clothes — see review1.

## ex4 - securing an endpoint, and testing it

The policy does three things and each is worth naming:
`AddAuthenticationSchemes(I2Jwt.Scheme)` says *which* credential to look at,
which matters the moment an application has more than one scheme — this lesson
and lesson 09 each have their own, which is exactly why the drill uses a named
scheme rather than the default. `RequireAuthenticatedUser()` produces the 401.
`RequireRole("auditor")` produces the 403.

The reason to register a **named policy** rather than inline the role check is
that "who may read the audit log" is a business rule that will change — to a
second role, to a claim, to a time-of-day condition — and when it does you want
one edit rather than a grep. That is also the answer to "how would you handle
permissions that are more complex than roles": a policy with a requirement and a
handler, and for anything that depends on the *record* being accessed,
`IAuthorizationService.AuthorizeAsync(user, resource, policy)` after you have
loaded it.

The testing half is the part candidates most often have no answer for. Minting
your own token in the test — same key, same issuer, same audience — against a
`WebApplicationFactory` gives you real end-to-end coverage of the whole
authentication and authorization path, with no identity provider and no mocking
of `ClaimsPrincipal`. It is thirty lines and it is reusable across a whole
codebase.

## ex5 - one place that handles failures

The three concerns in this middleware — map exceptions to responses, attach a
correlation id, choose a log level — are the ones every service needs and the ones
that get scattered across forty handlers if nobody puts them in one place early.

The exception-to-status mapping only lets *your own* exception types speak to the
client, because their messages are ones you wrote about the caller's request.
Everything else gets a generic title, because its message was written by a
library author for a developer reading a stack trace and may contain a path, a
server name or, as here, an API key.

The correlation id is set **before** the `try`, not in the `catch`, for two
reasons: successful responses need one too, and once the response has started you
cannot add a header anyway.

The log levels are the operational contract: Warning for the caller's mistakes,
Error for yours. The failure mode of getting this wrong is not technical — it is
that the alerting channel fills with 404s, someone mutes it, and the next real
incident is invisible.

In a modern codebase you would express the same thing as one or more
`IExceptionHandler` implementations registered with `AddExceptionHandler` plus
`app.UseExceptionHandler()`, and let `AddProblemDetails()` shape the body.
Writing it by hand once is how you know what those are doing.

## ex6 - the N+1, again

Yes, again. It is here twice on purpose: it is the single most-asked question
about EF Core, and the version you fix here — a loop that fetches the parent for
each child — is the exact shape you will meet in real code, usually written by
someone who was thinking about lists rather than tables.

The projection `t.Project!.Name` is a join expressed as a property access. The
`!` is a message to the compiler, not a dereference; nothing runs in your
process, because the whole lambda is an expression tree EF translates.

The follow-up to have ready is "how would you catch this before production", and
the answer is the gate you just ran: count the commands. Turn on the
`Microsoft.EntityFrameworkCore.Database.Command` category at Information, or
assert a query count in a test around the hot endpoint. Both are cheap, and query
counts are the only performance metric at this layer that is stable enough to
assert on.

## challenge - the take-home, and what is really being marked

A take-home is not marked on whether it works. It is marked on judgement, and
this one has four places to show it.

**Per-user filtering from the token.** If Grace can see Ada's note, nothing else
you did matters. This is OWASP API Security's number one, Broken Object Level
Authorization, and it is the thing reviewers check first.

**The group.** Putting `RequireAuthorization` on the `MapGroup` rather than on
each endpoint means the next endpoint someone adds is protected by default. That
is a small line with a large property: security that is opt-out rather than
opt-in.

**The total that respects the filter.** `X-Total-Count` must be *this caller's*
count, not the collection's. Reporting the global total leaks the size of other
people's data — a small leak, and exactly the sort of detail a careful reviewer
looks for.

**The owner from the token.** The create takes only a text; there is no field a
client could use to claim someone else's ownership. Enumerate what you accept.

If you have time left over in a real take-home, spend it on a README explaining
your trade-offs and on two or three tests of the authorization rules. Both are
rarer than working code and both are read.

## review1 - the idempotency key

POST is not idempotent, and that is a real problem the moment a network exists: a
client whose request times out cannot know whether the server received it, and
both possible actions — retry, or don't — are wrong in one of the two cases.

The industry answer is a client-generated `Idempotency-Key` header. The server
records key → result the first time, and replays the stored result for any
repeat. Note the details in the reference:

- the **key is checked before the body is validated**, because a replay must
  return the original result whatever the retry contains
- the replay returns **200, not 201**, because nothing was created this time —
  some APIs return 201 again for simplicity, and either is defensible provided
  the *body* is the original resource
- the retry's body is **ignored entirely**; the key identifies the operation, and
  the operation already happened

The parts a production implementation adds: keys expire (24 hours is typical);
the record is written in the same transaction as the work, or you can create the
resource and lose the key; a request that arrives while the first is still in
flight gets a 409 rather than a second attempt; and some APIs store a hash of the
request body so that reusing a key with a *different* payload is an error rather
than a silent replay. Stripe's idempotency documentation is the canonical
description and is worth reading once.

## Further reading

- [Rate limiting middleware in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit) — the built-in fixed, sliding, token-bucket and concurrency limiters.
- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) — requirements, handlers and resource-based checks.
- [Handle errors in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) — `IExceptionHandler`, `AddProblemDetails` and the RFC 9457 body.
- [Efficient querying in EF Core](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) — projection, N+1 and counting round trips.
- [RFC 9110 §9.2.2 — Idempotent methods](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods) — what idempotency actually promises, in the words that settle arguments.
- [Integration tests in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests) — `WebApplicationFactory`, the machinery behind every gate here.
