# 03 — Middleware and the pipeline

Your handler is never the first thing to see a request. By the time
`GetOrder(int id)` runs, something has already parsed the HTTP message, matched
a route, decided whether the caller is allowed in, possibly rejected them, and
started a stopwatch. That "something" is the **middleware pipeline**, and it is
the single most distinctive idea in ASP.NET Core: not a list of hooks, but a
chain of components, each one wrapped around the next.

The picture that makes it click is an onion, and it is worth drawing once:

```
request  ──▶ correlation ──▶ timing ──▶ auth ──▶ [ your handler ]
response ◀── correlation ◀── timing ◀── auth ◀───────┘
```

Every middleware gets the request on the way in *and* the response on the way
out. The order you add them is the order they see the request, and the exact
reverse of the order they see the response. That single fact explains almost
every "why doesn't my middleware work" question ever asked.

In this lesson you build small pipelines and mount them at routes, so you can
see the order rather than take it on trust.

## Concept — `next`, and the three ways to add something

A middleware is any class with this shape. There is no interface to implement
and no attribute to apply; ASP.NET Core finds `InvokeAsync` by convention:

```csharp
public class ExampleMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // on the way in - the request has not been handled yet
        context.Response.Headers["X-Example"] = "before";

        await next(context);          // run everything downstream

        // on the way out - the handler has finished
        Console.WriteLine(context.Response.StatusCode);
    }
}
```

`next` is the rest of the pipeline, compressed into one delegate. Three things
you can do with it, and they are the whole vocabulary:

- **Call it.** Your middleware is a pass-through that decorates the request or
  inspects the response.
- **Don't call it.** The request stops here and whatever you wrote onto the
  response is the answer. This is **short-circuiting**: how a 401, a cached
  response, or a rate-limit rejection is produced.
- **Call it conditionally**, or call it and then change your mind about the
  status code — with the important caveat below.

The caveat: **once the response has started, headers are frozen.** ASP.NET Core
writes the status line and headers the moment the first byte of the body is
flushed, so a middleware that tries to set a header *after* `await next(...)`
usually finds it has no effect, or throws. Set headers on the way in; read
status codes on the way out.

Three methods put middleware into a pipeline, and knowing which is which is a
guaranteed interview question:

| method | what it does |
|---|---|
| `app.Use(...)` / `app.UseMiddleware<T>()` | adds a link in the chain; it may call `next` |
| `app.Run(...)` | adds a **terminal** — it has no `next` and always ends the request |
| `app.Map("/x", branch)` | splits the pipeline: `/x` goes down a separate chain and never comes back |
| `app.UseWhen(pred, branch)` | splits on a predicate, and the branch **rejoins** the main pipeline if it does not terminate |

`Run` at the end of a chain is not decoration — a pipeline with no terminal
just 404s.

### How this lesson mounts a pipeline

Normally you would add middleware to `Program.cs` with `app.UseWhatever()`. In
this course `Program.cs` stays a composition root, so each exercise builds its
own little pipeline and mounts it at a route:

```csharp
var pipeline = app.CreateApplicationBuilder();   // a fresh, empty chain
pipeline.UseMiddleware<ExampleMiddleware>();
pipeline.Run(context => context.Response.WriteAsync("done"));

app.Map("/l03/example", pipeline.Build());       // mount it
```

`CreateApplicationBuilder()` gives you the same `IApplicationBuilder` that
`Program.cs` uses, and `Build()` turns the chain into a single
`RequestDelegate`. Everything you learn here is the same API you would use at
the top of a real application; only the mounting differs.

One more piece you will need: a middleware can take *per-request* services as
extra parameters on `InvokeAsync`, even though its constructor runs only once:

```csharp
public async Task InvokeAsync(HttpContext context, IStatusLog log) { … }
```

The constructor is called once when the pipeline is built, so anything injected
there is effectively a singleton — putting a scoped service in a middleware
constructor is the captive dependency from lesson 02, wearing a hat.
`InvokeAsync` parameters are resolved from the request's scope, which is where
scoped services belong.

## Exercise 1 — your first middleware

Edit `src/Api/L03_Middleware/Ex1.cs`. Implement `StampMiddleware.InvokeAsync`
so that `GET /l03/stamp`:

- comes back with the response header `X-Dojo-Stamp: l03`, and
- still has the body `handler`, written by the terminal that sits after you

Two lines. The second one is the one people forget: if you do not call `next`,
the request stops at your middleware and the body is empty.

```
uv run dojo test dotnet 03_middleware ex1
```

## Exercise 2 — the order is the design

Edit `src/Api/L03_Middleware/Ex2.cs`, and only the `Configure` method. Three
marker middlewares are given; each one stamps the trace on the way in and again
on the way out. Add all three so that `GET /l03/order` returns exactly:

```
correlation>,timing>,auth>,handler,auth<,timing<,correlation<
```

The order is not arbitrary, and the reasoning is what to take away.
Correlation goes outermost so that *every* log line, including the timing
numbers and any authentication failure, can be tied to one request. Timing goes
next, so the time you report includes the cost of authenticating — otherwise
your dashboards will show a fast API while users wait. Auth goes last, closest
to the handler, because it is the final gate before your code runs.

```
uv run dojo test dotnet 03_middleware ex2
```

## Exercise 3 — short-circuiting

Edit `src/Api/L03_Middleware/Ex3.cs`. Implement `ApiKeyMiddleware.InvokeAsync`
so that a request to `/l03/secure` only reaches the handler when the header
`X-Api-Key` is exactly `dojo-key`. Anything else — a missing header, a wrong
value — gets **401** and goes no further.

The middleware downstream of yours sets `X-Reached-Handler: yes`, and the gate
checks that the header is *absent* on your 401. That is the real test of a
short-circuit: it is not enough to set the status code, you have to stop the
request. `context.Response.StatusCode = 401;` followed by `await next(context)`
is the classic broken version — it sets a status the handler will then overwrite
while doing all the work you meant to prevent.

```
uv run dojo test dotnet 03_middleware ex3
```

## Exercise 4 — `Use`, `UseWhen` and `Run`

Edit `src/Api/L03_Middleware/Ex4.cs`, method `Configure`. Build a pipeline,
mounted under `/l03/branch/`, that:

- adds `X-Branch-Seen: all` to **every** response under that prefix
- answers with the body `admin` for any path under `/l03/branch/admin`
- answers with the body `default` for everything else

Three pieces, one of each kind: a `Use` for the shared header, a `UseWhen`
whose predicate looks at `context.Request.Path`, and a `Run` for the fallback.
`HttpRequest.Path` has a `StartsWithSegments` method that compares whole path
segments — worth preferring over `StartsWith`, which would also match
`/l03/branch/administrators`.

```
uv run dojo test dotnet 03_middleware ex4
```

## Challenge — a pipeline that is only correct in one order

Honest difficulty note: two small middlewares plus three lines of ordering.
Every wrong order still compiles and still returns plausible answers, which is
exactly what makes pipeline bugs expensive.

Edit `src/Api/L03_Middleware/Challenge.cs`. `CorrelationIdMiddleware` is given.
Implement the other two and arrange all three in `Configure` so that
`/l03/challenge/…`:

- always answers with an `X-Correlation-Id` header — **including on rejections**
  — echoing the client's value when one was sent
- answers **401** when `X-Api-Key` is not `dojo-key`
- answers **403** for paths under `/l03/challenge/admin` when the caller has a
  valid key but no `X-Role: admin` header
- answers **200 ok** otherwise

The 401-must-still-be-correlated requirement is what pins the order down. A
correlation id that only appears on successful responses is worse than none: the
requests you most need to trace are the ones that failed.

```
uv run dojo test dotnet 03_middleware challenge
```

## Review

`review1` is not part of finishing this lesson; the scheduler brings it back
later. Edit `src/Api/L03_Middleware/Review1.cs`: implement
`StatusRecorderMiddleware` so it records the status code each request ended
with, and order it against the given `TeapotMiddleware` (which short-circuits
with **418** for paths ending in `/teapot`) so that the recorder sees both a
418 and a 200. The question underneath: *which side of a short-circuit do you
have to be on to observe it?*

## The gate

This is the entire gate class, `tests/Gates/L03_MiddlewareTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class L03_MiddlewareTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_TheStampMiddlewareAddsAHeaderAndLetsTheRequestThrough()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l03/stamp");

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l03/stamp must answer 200. A 500 means StampMiddleware still throws - "
                + "reread README ex1.");

        Teach.Equal("l03", Header(response, "X-Dojo-Stamp"),
            "The middleware has to add the response header X-Dojo-Stamp with the value "
                + "\"l03\", and it has to add it BEFORE awaiting next - once the handler has "
                + "written the response, headers can no longer be changed.");

        Teach.Equal("handler", await response.Content.ReadAsStringAsync(),
            "The body should still be \"handler\", which is what the terminal handler writes. "
                + "An empty body means your middleware never called next, so nothing "
                + "downstream ran.");
    }

    [Fact]
    public async Task Ex2_ThePipelineIsAnOnionAndTheOrderIsVisible()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l03/order");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l03/order must answer 200 - reread README ex2.");

        Teach.Equal(
            "correlation>,timing>,auth>,handler,auth<,timing<,correlation<",
            await response.Content.ReadAsStringAsync(),
            "That trace is the shape of your pipeline. Read it as a nesting: everything "
                + "between correlation> and correlation< happened inside the correlation "
                + "middleware. The first middleware you add is the outermost one, and the "
                + "order on the way out is the reverse of the order on the way in.");
    }

    [Fact]
    public async Task Ex3_TheKeyCheckStopsTheRequestDead()
    {
        using var client = factory.CreateClient();

        var anonymous = await client.GetAsync("/l03/secure");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No X-Api-Key header at all must be 401 - reread README ex3.");
        Teach.Equal("", Header(anonymous, "X-Reached-Handler"),
            "Short-circuiting means NOT calling next. The middleware downstream of yours "
                + "still ran and set X-Reached-Handler, so the request carried on past your "
                + "401 - you set the status code and then awaited next anyway.");
        Teach.Equal("", await anonymous.Content.ReadAsStringAsync(),
            "The secret was written to the body of a 401. Return without calling next.");

        var wrong = await client.SendAsync(WithKey("nope"));
        await Teach.Status(HttpStatusCode.Unauthorized, wrong,
            "A present-but-wrong key is still a 401.");

        var allowed = await client.SendAsync(WithKey("dojo-key"));
        await Teach.Status(HttpStatusCode.OK, allowed,
            "With the right key the request must reach the handler: 200.");
        Teach.Equal("yes", Header(allowed, "X-Reached-Handler"),
            "The rest of the pipeline has to run when the key is valid - call next.");
        Teach.Equal("secret", await allowed.Content.ReadAsStringAsync(),
            "…and the terminal handler's body comes back.");

        static HttpRequestMessage WithKey(string key)
        {
            var message = new HttpRequestMessage(HttpMethod.Get, "/l03/secure");
            message.Headers.Add("X-Api-Key", key);
            return message;
        }
    }

    [Fact]
    public async Task Ex4_UseRunsForEveryoneAndTheBranchOnlyForSome()
    {
        using var client = factory.CreateClient();

        var admin = await client.GetAsync("/l03/branch/admin/reports");
        await Teach.Status(HttpStatusCode.OK, admin,
            "GET /l03/branch/admin/reports must answer 200 - reread README ex4.");
        Teach.Equal("admin", await admin.Content.ReadAsStringAsync(),
            "Anything under /l03/branch/admin is handled by the branch, which answers "
                + "\"admin\".");
        Teach.Equal("all", Header(admin, "X-Branch-Seen"),
            "The Use middleware runs for every request, branch or not, because it was added "
                + "before the branch. If this header is missing you added it inside the "
                + "branch or after the terminal.");

        var other = await client.GetAsync("/l03/branch/orders");
        Teach.Equal("default", await other.Content.ReadAsStringAsync(),
            "/l03/branch/orders is not under /admin, so it falls through to the terminal "
                + "Run, which answers \"default\". Getting \"admin\" here means the branch "
                + "predicate matches everything.");
        Teach.Equal("all", Header(other, "X-Branch-Seen"),
            "The shared middleware runs on this path too.");
    }

    [Fact]
    public async Task Challenge_EveryResponseIsCorrelatedEvenTheRejections()
    {
        using var client = factory.CreateClient();

        var anonymous = await client.GetAsync("/l03/challenge/reports");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No API key is a 401 - reread README challenge.");
        Teach.True(Header(anonymous, "X-Correlation-Id").Length > 0,
            "A 401 with no correlation id is an incident nobody can trace. The correlation "
                + "middleware has to run BEFORE the thing that might reject the request, so "
                + "add it first.");

        var tagged = new HttpRequestMessage(HttpMethod.Get, "/l03/challenge/reports");
        tagged.Headers.Add("X-Correlation-Id", "trace-me");
        var taggedResponse = await client.SendAsync(tagged);
        Teach.Equal("trace-me", Header(taggedResponse, "X-Correlation-Id"),
            "A correlation id the client supplied must be echoed, not replaced - that is how "
                + "a request is followed across services.");

        var forbidden = await client.SendAsync(Keyed("/l03/challenge/admin/tools", role: null));
        await Teach.Status(HttpStatusCode.Forbidden, forbidden,
            "A valid key with no admin role, on an admin path, is 403: authenticated but not "
                + "allowed. 401 would mean 'I do not know who you are', which is false here.");

        var admin = await client.SendAsync(Keyed("/l03/challenge/admin/tools", role: "admin"));
        await Teach.Status(HttpStatusCode.OK, admin,
            "Right key, right role: 200.");
        Teach.Equal("ok", await admin.Content.ReadAsStringAsync(),
            "…and the terminal handler runs.");

        var ordinary = await client.SendAsync(Keyed("/l03/challenge/reports", role: null));
        await Teach.Status(HttpStatusCode.OK, ordinary,
            "/l03/challenge/reports is not an admin path, so a valid key is enough. Getting "
                + "403 here means the admin check is not inside a branch - it is running for "
                + "every path.");

        static HttpRequestMessage Keyed(string path, string? role)
        {
            var message = new HttpRequestMessage(HttpMethod.Get, path);
            message.Headers.Add("X-Api-Key", "dojo-key");
            if (role is not null)
            {
                message.Headers.Add("X-Role", role);
            }

            return message;
        }
    }

    [Fact]
    public async Task Review1_TheOutermostMiddlewareSeesTheFinalStatusCode()
    {
        using var client = factory.CreateClient();

        var teapot = await client.GetAsync("/l03/review/pipeline/teapot");
        await Teach.Status((HttpStatusCode)418, teapot,
            "Given code refuses to brew coffee with 418. If this is a 500, "
                + "StatusRecorderMiddleware still throws - reread README review.");

        Teach.Equal(418, await LastStatus(client),
            "The recorder never saw the 418, because the middleware that produced it "
                + "short-circuited first. Whatever wants to observe a response has to be "
                + "OUTSIDE the thing that produces it.");

        await client.GetAsync("/l03/review/pipeline/tea");
        Teach.Equal(200, await LastStatus(client),
            "A request that reaches the terminal handler ends as a 200, and the recorder "
                + "should have seen that too.");
    }

    private static async Task<int> LastStatus(HttpClient client)
    {
        var body = await client.GetFromJsonAsync<LastStatusDto>("/l03/review/last-status");
        return body?.Status ?? -1;
    }

    private static string Header(HttpResponseMessage response, string name) =>
        response.Headers.TryGetValues(name, out var values) ? string.Join(",", values) : "";

    private sealed record LastStatusDto(int Status);
}
```

In plain English: every assertion here is about something a client can see — a
header, a status code, a body — because the pipeline has no other observable
surface. ex2 reads the whole shape of the onion out of one string. ex3 proves a
short-circuit by checking that a *downstream* header is missing. The challenge
proves ordering by checking that a rejection still carries the header added by
the middleware above it.

## The teaching point

When a middleware "doesn't work", there are only ever four causes, and you can
now name all of them: it was added in the wrong order; it did not call `next`
when it should have; it called `next` when it should not have; or it tried to
touch headers after the response had already started.

The deeper habit is thinking about *where a concern belongs*. Anything that
must apply to every request regardless of route — correlation ids, timing,
compression, HTTPS redirection, exception handling — is middleware. Anything
that only applies to some endpoints is either a branch, a group convention, or
an endpoint filter. Getting that split right is most of what separates a
codebase where cross-cutting concerns are one file each from one where they are
copy-pasted into forty handlers.

Next: **04_configuration_options**, where the values your middleware and
services need stop being constants in the source and start coming from
configuration.
