# Reading - dotnet/03_middleware

The pipeline is where ASP.NET Core stops looking like a routing library and
starts looking like a web server you can reason about. Everything
cross-cutting — authentication, HTTPS, compression, CORS, exception handling,
tracing — is a middleware, which means all of it obeys the same three rules you
just used.

## Notes

**What `next` actually is.** `IApplicationBuilder.Build()` walks your list of
middleware factories *backwards*, starting from a terminal delegate (a 404
handler if you never added a `Run`), and wraps each one around what it has so
far. The result is a single `RequestDelegate` — one function from `HttpContext`
to `Task` — with your whole chain closed over inside it. There is no list being
iterated at request time and no framework loop dispatching to hooks; the
composition happened once at startup. That is why the order of your
registration lines is the order of execution, and why it cannot change at
runtime.

**Two ways to write one.** The inline form, `app.Use(async (context, next) =>
{ … })`, is right for three lines. The class form — a constructor taking
`RequestDelegate next` plus an `InvokeAsync(HttpContext)` method, added with
`UseMiddleware<T>()` — is right for anything with dependencies or tests. There
is also `IMiddleware`, an actual interface, which is resolved from DI *per
request* and so can hold scoped dependencies as fields; it needs to be
registered in the container itself, which is the trade. Convention-based
classes are the common case by a wide margin.

**Middleware constructors run once.** `UseMiddleware<T>` builds one instance
when the pipeline is built and reuses it for every request, so its constructor
parameters come from the *root* provider and behave as singletons. Put a scoped
service there and you have a captive dependency; in Development you will get an
outright error the first time it runs. The supported route is extra parameters
on `InvokeAsync`, which are resolved from the request scope. Same rule as
lesson 02, new disguise.

**The response has a point of no return.** Status code and headers are buffered
until the first body byte is written or the response is explicitly started;
after that, `HasStarted` is true and mutating headers throws. This is why the
"handle the exception and turn it into a nice 500" pattern in lesson 08 has to
sit *outside* everything that writes, and why a middleware that wants to add a
header based on the outcome uses `context.Response.OnStarting(callback)` —
a hook that fires at the last possible moment before the headers go out.

**`Map` versus `UseWhen`.** `Map` splits the pipeline permanently: the branch
handles the request and never returns to the main chain, and it also strips the
matched prefix off `Request.Path` into `Request.PathBase`. `UseWhen` runs the
branch and, if the branch does not terminate, control comes back and continues
down the main pipeline. `MapWhen` is the predicate-based version of `Map` — a
split that does not rejoin. Choosing wrongly gives you either a shared terminal
you did not want or a branch that mysteriously falls through.

**Middleware versus endpoint filters.** Since .NET 7 there is a second, smaller
extension point: `AddEndpointFilter` runs around a *single endpoint's handler*,
after routing and model binding, and it sees the bound arguments. Validation
belongs there far more naturally than in middleware, which only has raw
`HttpContext`. Rule of thumb: if it applies to every request and needs no
knowledge of the endpoint, it is middleware; if it applies to some endpoints and
wants their arguments, it is a filter.

## ex1 - the two lines, and which order they go in

Setting the header before `await next(context)` is not stylistic. The terminal
handler writes the body, which starts the response, which freezes the headers —
so a `X-Dojo-Stamp` assignment placed after the await is a line that either
silently does nothing or throws `InvalidOperationException`. Anything you want
to *send* goes on the way in; anything you want to *observe* goes on the way
out.

The second half is `next` itself. A middleware that forgets to call it is not
broken in an obvious way: it returns a 200 with an empty body, because the
status code defaults to 200 and nothing ever wrote anything. That is the same
failure mode as an accidental short-circuit, and it is why the gate checks the
body as well as the header.

Note the primary constructor: `StampMiddleware(RequestDelegate next)` captures
`next` as a field without you declaring one. `UseMiddleware<T>` supplies that
argument itself; any *other* constructor parameters are resolved from the
container.

## ex2 - why that order, in a real system

The trace is a picture of nesting. `correlation>` appears first and
`correlation<` last, so everything else happened *inside* the correlation
middleware — which is exactly the property you want from something whose job is
to tag all the work belonging to one request.

The ordering argument generalises. Ask, for each pair: *does the outer one need
to see what the inner one did, or make something available to it?*

- Correlation must be outermost because logging, timing and the failure path
  all want the id. If it were innermost, an authentication rejection would be
  logged with no id and you could not join it to anything.
- Timing wraps auth because the user's experience includes the time spent
  validating a token, calling an identity provider, or hitting a cache miss. A
  timer that starts after auth reports a number nobody outside the process can
  reproduce.
- Auth is innermost because it is the last gate; anything after it can assume a
  caller.

Real `Program.cs` files have a canonical order for the same reason, and it is
worth having seen it: exception handler, HSTS, HTTPS redirection, static files,
routing, CORS, authentication, authorisation, endpoints. Every adjacent pair in
that list has an argument like the ones above behind it. The most commonly
botched pair is CORS-before-auth: put them the other way round and a browser
preflight gets rejected with a 401 that has no CORS headers on it, so the
browser reports a CORS error and you spend an afternoon looking in the wrong
place.

## ex3 - what a short-circuit really is

Short-circuiting is defined by omission: you *do not* call `next`. Everything
else — setting a status code, writing a body — is just what you happen to do
before returning.

The broken version the gate is designed to catch looks reasonable:

```csharp
if (!Valid(context)) { context.Response.StatusCode = 401; }
await next(context);            // ← the bug
```

The status is set, and then the handler runs anyway, does the work, and writes
a 200 over the top. The request you meant to reject has now hit your database.
Checking that a *downstream* marker header is absent is the only way to prove
from outside that the pipeline really stopped — a fact worth remembering when
you write tests for your own auth middleware.

One more detail: `return Task.CompletedTask` versus `return;` in an `async`
method are the same thing here. The reference is not `async` at all, because it
never awaits anything on the rejection path, and returning the task from `next`
directly avoids an unnecessary state machine. That is a micro-optimisation, but
it is idiomatic in framework-level code and you will see it everywhere.

## ex4 - Use, Run, Map, UseWhen

Four names, one distinction repeated twice. `Use` continues, `Run` terminates.
`UseWhen` continues after the branch, `Map`/`MapWhen` do not.

The `Use` middleware that adds `X-Branch-Seen` runs for both paths because it
sits above the split. Move it inside the `UseWhen` and only admin requests get
it; move it after the `Run` and nothing gets it, because the terminal already
ended the request — a middleware registered after a terminal is dead code, and
nothing warns you.

`StartsWithSegments` over `StartsWith` is the small but real lesson.
`Request.Path` is a `PathString`, a type that exists specifically to make
segment-aware comparisons the easy ones: `StartsWithSegments("/admin")` matches
`/admin` and `/admin/users` but not `/administrators`. Path-prefix checks
written with plain string methods are a recurring source of authorisation
bypasses.

## challenge - order as a security property

The requirement that pins everything down is "the 401 must still carry a
correlation id". It forces correlation above the key check, and once you see
why, you have the general rule: **anything that must be true of every response,
including the ones you reject, has to be added before the thing that rejects.**
The same argument governs CORS headers on error responses and rate-limit
headers on 429s.

The admin check being inside a `UseWhen` is the second half. Put it in the main
chain and it applies everywhere, so ordinary endpoints start demanding a role
they never needed — a failure that is *safe* (nobody gets extra access) but
completely breaks the API. The opposite mistake, putting the key check inside
the branch, is the dangerous one: unauthenticated callers sail through
everything except `/admin`.

401 versus 403 is the third: 401 means "I do not know who you are, authenticate
and try again"; 403 means "I know exactly who you are and the answer is no". A
403 with a `WWW-Authenticate` header, or a 401 for a logged-in user who lacks a
role, both tell the client to do something that cannot help.

## review1 - which side of the short-circuit are you on?

`TeapotMiddleware` never calls `next` for `/teapot`, so nothing below it in the
chain runs. A recorder placed below therefore records nothing at all — the
request it most wanted to record is exactly the one it cannot see. Placed
above, it awaits `next`, control returns as soon as the teapot middleware
returns, and `context.Response.StatusCode` is already 418.

This is the shape of every observability middleware in existence: logging,
metrics, tracing and exception handling all have to be outside the things they
observe, which is why the canonical `Program.cs` order starts with them. It is
also the reason "add logging" is not a thing you can bolt on at the bottom of a
pipeline later.

Note that the recorder reads `Response.StatusCode` *after* the await and takes
its scoped dependency as an `InvokeAsync` parameter rather than a constructor
one. Both details are load-bearing, and both come straight from lesson 02.

## Further reading

- [ASP.NET Core Middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/) — the pipeline model, `Use`/`Run`/`Map`, and the diagram this lesson's onion is based on.
- [Write custom ASP.NET Core middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write) — the convention-based class, `IMiddleware`, and per-request dependencies.
- [Middleware order](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/#middleware-order) — the canonical `Program.cs` ordering and why each step sits where it does.
- [Request and response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response) — `HasStarted`, `OnStarting`, and what happens once the response is on the wire.
- [Filters versus middleware in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters) — endpoint filters, and when to reach for them instead.
