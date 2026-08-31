# Reading - dotnet/d06_middleware_order

## Notes

The pipeline is a stack of nested function calls, not a queue. Each middleware
gets a chance to act **on the way in**, hands control to `next`, and then gets a
chance to act **on the way out** — so registration order is inside-out order,
and the first thing registered is the last thing to finish.

Every problem in this set is that one picture, tested from a different side. A
guard must be outside the work it guards. A terminal delegate has nothing after
it. A branch either rejoins or it does not. A header must be written before the
response starts. And code after `await next(...)` is not a `finally` — it is
ordinary code that a downstream exception skips entirely.

The habit worth building: when you place a middleware, ask two questions. What
must it wrap? And what must still run if the thing inside it fails? The answers
put it in exactly one place.

## ex1

The two requirements are real ones. Timing that does not wrap authentication
does not measure authentication, and the slow request you are trying to explain
looks fast. Authentication that runs *after* the cache means a cache hit is
served to someone who was never allowed to ask — an authorization bypass that no
test of the handler will ever catch, because the handler never runs.

The classic mistake is treating order as an implementation detail and putting
new middleware at the end because that is where the cursor was. The model
answer picks each position from a sentence about what must wrap what.

## ex2

Short-circuiting only saves you something if it happens before the cost.
`ExpensiveMiddleware` after the guard is a rate limiter that rate-limits nothing,
an auth check that authenticates after the database query, a request-size check
that runs once the body is already buffered.

The gate asserts the *absence* of a mark, which is the honest way to test a
short-circuit: it is easy to write a guard that sets a 401 and calls `next`
anyway, and the status code alone will not tell you.

Note the trace stops at `guard>` and never reaches `guard<`. That is not a bug —
the guard returns before its own post-`next` line, which is the same mechanism
ex7 explores from the other end.

## ex3

`Use` passes control on; `Run` does not. `Run` takes a `RequestDelegate` with no
`next` parameter at all, which is the API telling you it is terminal. Anything
registered after it is unreachable, and nothing warns you — no compiler error,
no startup failure, just a trace with one entry in it.

The classic mistake is subtler than the shipped stub: writing
`app.Run(...)` early "temporarily" while debugging and leaving it in, or calling
`app.UseRouting()` after something that already terminated. The rule is one
line: terminal delegates last, always.

## ex4

`UseWhen` runs a branch when a predicate matches, and the branch **rejoins** the
main pipeline afterwards. That is the one to reach for when a subset of requests
needs extra treatment but the same handling in the end — a stricter rate limit
for one path prefix, an extra header for one tenant, request logging only for
API routes.

The classic mistake is using it as if it were terminal and being surprised that
the rest of the pipeline still ran. The other one is a predicate that is too
loose: `Path.StartsWithSegments` respects segment boundaries, so it matches
`/admin/reports` but not `/administrators` — `Path.Value.StartsWith("/admin")`
would match both, which is a security bug the day someone adds that route.

## ex5

`MapWhen` is the terminal cousin: the branch is a pipeline of its own, and
control never comes back. Everything after it in the main pipeline is skipped
for matching requests, which is right when the branch is an *alternative* rather
than an addition — a legacy compatibility shim, a maintenance-mode responder, a
feature-flagged v2 implementation.

Because it does not rejoin, a `MapWhen` branch must terminate itself. A branch
with no `Run` at the end produces a 404, which is a confusing way to discover
the rule.

Worth having straight for interviews: `Use` (wrap), `Run` (terminate),
`Map` (branch on a path prefix, and rebase `Request.Path`/`PathBase`),
`MapWhen` (branch on a predicate, terminal), `UseWhen` (branch on a predicate,
rejoins).

## ex6

Headers are part of the response *start line block*: once a single byte of body
has been written, they have been sent, and the framework throws if you try to
change them. So the natural-looking `await next(...); Response.Headers[…] = …`
is wrong, and the equally natural "write it up front" produces an empty value
because nothing has happened yet.

`HttpResponse.OnStarting` is the hook: register a callback before `next`, and it
runs at the last possible instant — after the handler has decided everything and
before the first byte leaves. This is how timing headers, correlation ids and
`Server-Timing` are added in real services.

Look closely at the expected value: `work>,handler` and not `work<`. The
callback fires when the handler writes, which is *before* the pipeline unwinds.
A header can only ever describe what has already happened.

## ex7

The mark to stare at is `audit<`. Code placed after `await next(context)` is not
a `finally` block — if `next` throws, that line is skipped and the exception
keeps propagating. So a logging or metrics middleware written the obvious way
silently stops recording exactly the requests that failed.

Two fixes, and knowing both is the point. Put a `try/finally` in the middleware
itself, which is what `CatchMiddleware` does for its own closing mark. Or put
something that swallows the exception *between* you and the danger, which is what
this exercise's ordering does.

The other half is the catcher's own position: a `try/catch` can only see what is
downstream of it, so exception handling belongs near the outside of the pipeline
— which is exactly where `UseExceptionHandler` tells you to put it.

## ex8

Everything at once, and each of the four positions is forced by a sentence.

The header middleware is **outermost** because every response must carry the
trace — and the responses you most want to trace are the 401s and 503s, which
are produced by middleware further in. Put it inside the guard and the failing
requests are the ones missing the header.

The catcher is **outside the guard and the handler** because it can only catch
what is downstream. The guard is **outside the branch** because a branch that
runs before authentication is work done for callers who never proved anything.
The branch is innermost because it is an addition to the handled path, not a
replacement for it.

That ordering — observability, then error handling, then authentication, then
routing-shaped concerns, then the handler — is close to the order ASP.NET
Core's own documentation recommends for a real application, and it is worth
being able to justify each step out loud.

## Further reading

- [ASP.NET Core Middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware) — `Use`, `Run`, `Map`, and the recommended order for a real pipeline.
- [Write custom middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write) — the convention-based class, `next`, and short-circuiting.
- [HttpResponse.OnStarting](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.onstarting) — the hook for anything that must be decided before the first byte.
- [Handle errors in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) — `UseExceptionHandler` and why it belongs near the outside.
- [Request and response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response) — what "the response has started" actually means, and what stops being possible after it.
