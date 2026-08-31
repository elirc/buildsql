# Reading - dotnet/d07_middleware_custom

## Notes

A middleware is a function from `HttpContext` to `Task` that happens to be
allowed to call another one. Everything in this set follows from that: you hold
the request before anyone else sees it, you hold the response after everyone
else has written it, and you decide whether "everyone else" runs at all.

The skill being drilled is the *mechanics* — the exact shape of the class, where
its dependencies come from, how to read a stream twice, how to hold the pen
while something downstream writes. Order was d06's job; this set assumes the
position is already right and asks whether you can write the component.

The one distinction to carry away: a **convention-based** middleware is built
once, at startup, and lives for the life of the application. A **factory-based**
one (`IMiddleware`) is resolved from the container on every request. That single
fact decides what each of them is allowed to depend on.

## ex1

The convention: a public class, a constructor whose first parameter is
`RequestDelegate next`, and a public `InvokeAsync(HttpContext)` returning
`Task`. No interface, no base class, no registration — `UseMiddleware<T>` finds
the method by name and shape at startup, and gets it wrong at *runtime* rather
than at compile time if you misspell it.

The other half is `HttpContext.Items`: a per-request dictionary that is the
normal way one middleware hands a fact to something downstream. It is thrown
away when the request ends, which is exactly the lifetime you want for
"this request is being traced".

The classic mistake is a `static` field instead — which works perfectly until
two requests arrive at once.

## ex2

`UseMiddleware<T>(args…)` passes extra arguments to the constructor after
`next`, and anything it does not supply is resolved from the container. That is
how one middleware class serves two configurations, and it is why the same type
can appear twice in a pipeline with different behaviour.

The idiomatic version wraps this in an extension method
(`app.UseBanner("X-Banner", "alpha")`) and often takes an options object rather
than loose strings, so the call site reads as a sentence and new settings do not
change the signature. That is the shape almost every published middleware
package uses.

The classic mistake is a static or captured configuration field, which quietly
makes the second registration overwrite the first.

## ex3

`IMiddleware` exists for one reason: a convention-based middleware is a
**singleton**, so a scoped dependency in its constructor is a captive dependency
— and in Development the container refuses to start rather than let it happen.
An `IMiddleware` implementation is resolved per request from
`context.RequestServices`, so it can hold whatever the request holds.

The price is that it must be **registered** — the shipped stub's 500 is the
container saying exactly that — and that resolving it costs a little on every
request.

Which to use, in one sentence: convention-based by default, `IMiddleware` when
the middleware needs a scoped service or you want it constructed by the
container so it can be replaced in a test. The third option is neither: take
`IServiceProvider` in a convention-based middleware and resolve per call, which
is d04 ex2's trick and works when you only need it occasionally.

## ex4

Two status codes people confuse. **401 Unauthorized** means "I do not know who
you are", and RFC 9110 requires it to carry `WWW-Authenticate` naming the
scheme, so a client knows *how* to try again. **403 Forbidden** means "I know who
you are and the answer is still no", and it carries nothing, because there is no
retry that would help.

The other rule the gate enforces is the short-circuit: no body, no `next`. A
refusal that still runs the handler is not a refusal, and the status code alone
will not tell you — which is why the gate reads the body rather than trusting
the code.

In a real application this whole middleware is `UseAuthentication` and
`UseAuthorization`, and you would write a scheme handler rather than this.
Writing it once is how you know what those are doing.

## ex5

A request body is a forward-only stream. Read it to the end in middleware and
the handler finds nothing left — with no error, no warning, and a `null` model
that looks like a client bug.

`HttpRequest.EnableBuffering()` wraps the stream in one that can seek, spilling
to disk past a threshold. After that, read what you like and set
`Body.Position = 0` so the next reader starts at the beginning. The `leaveOpen:
true` on the `StreamReader` matters too: disposing the reader would close the
request stream underneath everyone else.

The cost is real — buffering means the body is held in memory or on disk rather
than streamed — so this belongs in middleware that needs it (request logging,
signature verification, idempotency hashing) and nowhere else.

## ex6

To change what something downstream wrote, you have to have been holding the
pen. Swap `Response.Body` for a `MemoryStream` **before** calling `next`, let
everything write into it, then read it, restore the real stream, and write what
you actually want.

Three details in the model answer are load-bearing. The `finally` restores the
original stream even if the handler throws, because leaving a dead `MemoryStream`
on the context breaks every middleware above you. The rewind (`Position = 0`)
before reading is the same rule as ex5. And the header is set *after* `next`
returns, which is only legal because nothing has been written to the real
response yet — the capture is what buys you that.

The honest caveat: this defeats streaming and buffers the whole response in
memory, and it will fight with `Content-Length` if something set one. Response
rewriting is a last resort; prefer an endpoint filter (d02 ex7) that transforms
the *result object* before it is ever serialised.

## ex7

A cache is a short-circuit with memory, and writing one exercises both halves of
this lesson: capture the response on a miss, and answer without calling `next`
on a hit. The gate proves it by making the handler's answer change every time it
runs — `made 2` coming back for a "hit" means the handler ran again and the
cache saved nothing.

What a real one adds is the interesting conversation. Keying on the path alone
ignores the query string, the `Vary` headers, the `Accept-Language`, and the
identity of the caller — the last of which turns a cache into a data leak.
Nothing here expires, so the first answer is the only answer forever. And
nothing coordinates two instances behind a load balancer.

ASP.NET Core ships `AddOutputCache()` for exactly this, with tags, expiry,
per-user policies and cache invalidation. Knowing it exists is half the answer;
being able to write the naive one is the other half.

## ex8

Everything at once, and each requirement maps onto one earlier exercise: ex3's
`IMiddleware` with a scoped dependency, ex5's request buffering, ex4's
short-circuit, ex6's response capture.

The ordering inside the method is the part worth rehearsing. Write the id header
first, because it must be on every response including the refusal. Buffer and
read the request *before* deciding, because the decision depends on its length.
Return early on the refusal — after setting its own record header, because the
short-circuit path skips everything after it. And only then swap the response
stream, because a captured response you never write back is a response the
client never gets.

The `X-Record-Id` check is the one that catches a lifetime mistake: the same id
on two requests means the middleware was registered as a singleton, and the
"scoped" recorder inside it has been captive since startup.

## Further reading

- [Write custom ASP.NET Core middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write) — the convention, `UseMiddleware` arguments, and the extension-method shape.
- [Factory-based middleware activation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/extensibility) — `IMiddleware`, `IMiddlewareFactory`, and why per-request activation matters.
- [Request and response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response) — `EnableBuffering`, reading a body twice, and safely swapping `Response.Body`.
- [Output caching middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output) — the framework's answer to ex7, with expiry, tags and policies.
- [RFC 9110 §11 — HTTP Authentication](https://www.rfc-editor.org/rfc/rfc9110.html#name-http-authentication) — what a 401 owes the client, and how 403 differs.
