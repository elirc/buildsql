# d07 — Writing middleware drills

Eight problems on writing the middleware itself rather than arranging it: the
convention-based class, constructor arguments, `IMiddleware`, refusing properly,
reading a request body without stealing it, capturing a response, answering from
a cache, and one component that does all of it. They drill lesson
**03_middleware** — go back to it if `next` is still mysterious.

Every exercise builds its own pipeline with `app.CreateApplicationBuilder()` and
hangs it off one path under `/d07/…`.

## Exercise 1 — the convention-based class

Edit `src/Api/D07_MiddlewareCustom/Ex1.cs`, `HandledMiddleware` only.

- always add the response header `X-D07-Handled: yes`
- when the query string contains `trace`, put `true` in `HttpContext.Items`
  under `HandledMiddleware.ItemKey`
- then let the rest of the pipeline run

`GET /d07/handled` answers `plain`; `GET /d07/handled?trace=1` answers `traced`.

```
uv run dojo test dotnet d07_middleware_custom ex1
```

## Exercise 2 — one type, two configurations

Edit `src/Api/D07_MiddlewareCustom/Ex2.cs`. Implement `BannerMiddleware` (set
the named header to the given value, then call `next`) and add it to the branch
in `Branch`, passing the arguments through.

`GET /d07/banner/a` gets `X-Banner: alpha`; `/d07/banner/b` gets
`X-Banner: beta`. Same class, two configurations.

```
uv run dojo test dotnet d07_middleware_custom ex2
```

## Exercise 3 — factory-based middleware

Edit `src/Api/D07_MiddlewareCustom/Ex3.cs`. `TagMiddleware` implements
`IMiddleware` and takes a **scoped** `IRequestTag`. Put this request's tag in
`X-Tag`, call `next`, and register the middleware so the container can build it.

The gate checks the header equals the body — the middleware and the handler must
share one tag — and that two requests get different ones.

```
uv run dojo test dotnet d07_middleware_custom ex3
```

## Exercise 4 — refusing properly

Edit `src/Api/D07_MiddlewareCustom/Ex4.cs`, `BearerGateMiddleware` only.

- no `Authorization` header → **401** carrying `WWW-Authenticate: Bearer`
- an `Authorization` that is not `BearerGateMiddleware.ValidToken` → **403**
- the valid token → call `next`

Neither refusal writes a body or calls `next`.

```
uv run dojo test dotnet d07_middleware_custom ex4
```

## Exercise 5 — read the body without stealing it

Edit `src/Api/D07_MiddlewareCustom/Ex5.cs`, `BodyLengthMiddleware` only. Put the
request body's length in `X-Body-Length` **and** leave the body readable for the
handler, which echoes it back.

As shipped the header is right and the echo is empty.

```
uv run dojo test dotnet d07_middleware_custom ex5
```

## Exercise 6 — rewrite what the handler wrote

Edit `src/Api/D07_MiddlewareCustom/Ex6.cs`, `ShoutMiddleware` only. Capture
everything the rest of the pipeline writes, report its length in
`X-Original-Length`, and send the **upper-cased** version to the client.

`GET /d07/shout` → body `HELLO FROM THE HANDLER`, header `22`.

```
uv run dojo test dotnet d07_middleware_custom ex6
```

## Exercise 7 — answer from a cache

Edit `src/Api/D07_MiddlewareCustom/Ex7.cs`, `CacheMiddleware` only. Key on
`Request.Path`:

- a hit → `X-Cache: HIT`, write the stored body, **do not call `next`**
- a miss → capture what the pipeline writes, store it, `X-Cache: MISS`, and send
  it on

The handler's answer changes every time it runs, so a cached response is easy to
tell from a fresh one: `made 1` for the first path, `made 2` for the second, and
never a `made 3`.

```
uv run dojo test dotnet d07_middleware_custom ex7
```

## Exercise 8 — one component that does all of it

Edit `src/Api/D07_MiddlewareCustom/Ex8.cs`. `RecordMiddleware` is factory-based
and holds a **scoped** `IRecorder`. It must:

- put `recorder.Id` in `X-Record-Id` on every response
- buffer the request body so the handler can still read it
- refuse a request body longer than `MaxRequestChars` (20) with **413**, the
  body `too large`, and no call to `next`
- capture the response and set `X-Record` to `"{request length}:{response
  length}"` — `25:9` on the refusal, since `too large` is nine characters

`POST /d07/record/one` with `hello` → `echo:hello` and `X-Record: 5:10`.

```
uv run dojo test dotnet d07_middleware_custom ex8
```

## The gate

This is the entire gate class, `tests/Gates/D07_MiddlewareCustomTests.cs`:

```csharp
using System.Net;

namespace DotnetDojo.Gates;

public class D07_MiddlewareCustomTests
{
    [Fact]
    public async Task Ex1_TheMiddlewareSetsAHeaderAndLeavesAFactBehind()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var plain = await client.GetAsync("/d07/handled");
        await Teach.Status(HttpStatusCode.OK, plain,
            "GET /d07/handled must answer 200 - reread README ex1.");
        Teach.Equal("yes", Header(plain, "X-D07-Handled"),
            "Every response gets the header, whatever else happens.");
        Teach.Equal("plain", await plain.Content.ReadAsStringAsync(),
            "…and the handler still runs, so the middleware has to call next.");

        var traced = await client.GetAsync("/d07/handled?trace=1");
        Teach.Equal("traced", await traced.Content.ReadAsStringAsync(),
            "HttpContext.Items is a per-request dictionary, and it is how one middleware "
                + "tells the handler something. \"plain\" here means the item was never set - "
                + "or was set under a different key.");
        Teach.Equal("yes", Header(traced, "X-D07-Handled"), "…and the header is still there.");
    }

    [Fact]
    public async Task Ex2_OneMiddlewareTypeServesTwoConfigurations()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var alpha = await client.GetAsync("/d07/banner/a");
        await Teach.Status(HttpStatusCode.OK, alpha,
            "GET /d07/banner/a must answer 200 - reread README ex2.");
        Teach.Equal("alpha", Header(alpha, "X-Banner"),
            "An empty header means BannerMiddleware was never added to the branch; a wrong "
                + "one means the arguments did not reach its constructor.");

        var beta = await client.GetAsync("/d07/banner/b");
        Teach.Equal("beta", Header(beta, "X-Banner"),
            "The SAME middleware class, configured differently. Getting \"alpha\" here means "
                + "the values were hard-coded rather than passed in.");

        Teach.Equal("banner", await beta.Content.ReadAsStringAsync(),
            "…and both branches still reach their handler.");
    }

    [Fact]
    public async Task Ex3_AFactoryBasedMiddlewareIsBuiltOncePerRequest()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var first = await client.GetAsync("/d07/tag");
        await Teach.Status(HttpStatusCode.OK, first,
            "GET /d07/tag must answer 200. A 500 saying no service for TagMiddleware has been "
                + "registered is the point: a class implementing IMiddleware is resolved from "
                + "the container on every request, so it has to be in the container. Reread "
                + "README ex3.");

        string headerTag = Header(first, "X-Tag");
        string bodyTag = await first.Content.ReadAsStringAsync();

        Teach.True(headerTag.Length > 0, "The middleware has to write this request's tag.");
        Teach.Equal(bodyTag, headerTag,
            "The middleware and the handler must have got the SAME IRequestTag, because they "
                + "are in the same request scope. Two different values mean the middleware is "
                + "resolving out of a different scope - or is not scoped at all.");

        var second = await client.GetAsync("/d07/tag");
        Teach.True(Header(second, "X-Tag") != headerTag,
            "…and a second request must get a different tag. The same value twice means the "
                + "middleware was registered as a singleton, which is exactly the thing a "
                + "convention-based middleware could not avoid.");
    }

    [Fact]
    public async Task Ex4_TheRefusalSaysWhatWouldHaveWorked()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var anonymous = await client.GetAsync("/d07/vault");
        await Teach.Status(HttpStatusCode.Unauthorized, anonymous,
            "No Authorization header at all: 401 - reread README ex4.");
        Teach.Equal("Bearer", Header(anonymous, "WWW-Authenticate"),
            "A 401 without WWW-Authenticate leaves the client guessing how to authenticate. "
                + "RFC 9110 says the header is required on a 401, and it is the difference "
                + "between a client that can retry and one that cannot.");
        Teach.Equal("", await anonymous.Content.ReadAsStringAsync(),
            "…and the handler must not have run.");

        var wrong = await client.SendAsync(WithAuth("Bearer nope"));
        await Teach.Status(HttpStatusCode.Forbidden, wrong,
            "A caller who presented a credential and it was not good enough gets 403, not "
                + "401. 401 means \"who are you\"; 403 means \"I know, and no\".");
        Teach.Equal("", await wrong.Content.ReadAsStringAsync(), "…and still no handler.");

        var allowed = await client.SendAsync(WithAuth("Bearer d07-token"));
        await Teach.Status(HttpStatusCode.OK, allowed, "The right token gets through…");
        Teach.Equal("secret", await allowed.Content.ReadAsStringAsync(), "…to the handler.");
    }

    [Fact]
    public async Task Ex5_ReadingTheBodyMustNotConsumeIt()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.PostAsync("/d07/echo", new StringContent("hello world"));
        await Teach.Status(HttpStatusCode.OK, response,
            "POST /d07/echo must answer 200 - reread README ex5.");

        Teach.Equal("11", Header(response, "X-Body-Length"),
            "\"hello world\" is 11 characters, and the middleware read them.");

        Teach.Equal("hello world", await response.Content.ReadAsStringAsync(),
            "An empty body here is the whole exercise: the request stream was read to the end "
                + "by the middleware and never rewound, so the handler found nothing left. A "
                + "request body is a forward-only stream until you ask for it not to be.");

        var second = await client.PostAsync("/d07/echo", new StringContent("again"));
        Teach.Equal("5", Header(second, "X-Body-Length"), "A second request, a shorter body…");
        Teach.Equal("again", await second.Content.ReadAsStringAsync(), "…and it still echoes.");
    }

    [Fact]
    public async Task Ex6_TheMiddlewareCanRewriteWhatTheHandlerWrote()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var response = await client.GetAsync("/d07/shout");
        await Teach.Status(HttpStatusCode.OK, response,
            "GET /d07/shout must answer 200 - reread README ex6.");

        Teach.Equal("HELLO FROM THE HANDLER", await response.Content.ReadAsStringAsync(),
            "The handler writes in lower case and the client must receive upper case. To "
                + "change what was written you have to have been holding the pen: swap "
                + "Response.Body for a stream of your own BEFORE calling next.");

        Teach.Equal("22", Header(response, "X-Original-Length"),
            "…and the header reports how long the original was, which you can only know after "
                + "next has returned. A 0 means it was set before the handler ran.");
    }

    [Fact]
    public async Task Ex7_TheSecondRequestNeverReachesTheHandler()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var miss = await client.GetAsync("/d07/cache/alpha");
        await Teach.Status(HttpStatusCode.OK, miss,
            "GET /d07/cache/alpha must answer 200 - reread README ex7.");
        Teach.Equal("MISS", Header(miss, "X-Cache"), "Nothing is cached yet, so this is a miss.");
        Teach.Equal("made 1", await miss.Content.ReadAsStringAsync(),
            "…and the handler ran, for the first time.");

        var hit = await client.GetAsync("/d07/cache/alpha");
        Teach.Equal("HIT", Header(hit, "X-Cache"), "The same path again is a hit…");
        Teach.Equal("made 1", await hit.Content.ReadAsStringAsync(),
            "…and the body is the STORED one. \"made 2\" means the handler ran again, so "
                + "nothing was actually saved - a cache that still does the work is not a "
                + "cache. Answer from the store and do not call next.");

        var other = await client.GetAsync("/d07/cache/beta");
        Teach.Equal("MISS", Header(other, "X-Cache"), "A different path is its own entry…");
        Teach.Equal("made 2", await other.Content.ReadAsStringAsync(),
            "…so the handler ran a second time, and only a second time.");

        var again = await client.GetAsync("/d07/cache/alpha");
        Teach.Equal("made 1", await again.Content.ReadAsStringAsync(),
            "…and alpha still answers with its own stored body, not beta's.");
    }

    [Fact]
    public async Task Ex8_OneMiddlewareBuffersRefusesCapturesAndReports()
    {
        using var host = new DojoWebFactory();
        using var client = host.CreateClient();

        var ok = await client.PostAsync("/d07/record/one", new StringContent("hello"));
        await Teach.Status(HttpStatusCode.OK, ok,
            "POST /d07/record/one must answer 200. A 500 about RecordMiddleware not being "
                + "registered means the factory-based middleware never made it into the "
                + "container - reread README ex8.");
        Teach.Equal("echo:hello", await ok.Content.ReadAsStringAsync(),
            "The handler has to be able to read the body, which means the middleware rewound "
                + "it after reading.");
        Teach.Equal("5:10", Header(ok, "X-Record"),
            "Five characters in, ten out - and the second number is only knowable after next "
                + "returned, from a response you captured.");

        string firstId = Header(ok, "X-Record-Id");
        Teach.True(firstId.Length > 0, "Every response carries the recorder's id.");

        var second = await client.PostAsync("/d07/record/two", new StringContent("hi"));
        Teach.Equal("2:7", Header(second, "X-Record"), "A shorter body, a shorter echo.");
        Teach.True(Header(second, "X-Record-Id") != firstId,
            "…and a different recorder, because the middleware holding it is built once per "
                + "request. The same id twice means it was registered as a singleton.");

        var huge = await client.PostAsync(
            "/d07/record/three", new StringContent("this body is far too long"));
        await Teach.Status(HttpStatusCode.RequestEntityTooLarge, huge,
            "25 characters is over the 20-character limit: 413.");
        Teach.Equal("too large", await huge.Content.ReadAsStringAsync(),
            "…with its own body, and the handler must not have run - \"echo:\" appearing here "
                + "means the refusal did not short-circuit.");
        Teach.Equal("25:9", Header(huge, "X-Record"),
            "…and the record still reports both lengths.");
    }

    // … private helpers, listed below …
}
```

…where the helpers are `WithAuth` (a request carrying `Authorization`) and
`Header`.
