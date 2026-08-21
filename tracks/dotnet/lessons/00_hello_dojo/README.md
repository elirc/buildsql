# 00 — Hello, Dojo (ASP.NET Core)

Welcome to the .NET track. Everything you have written so far in this dojo has
been a function that someone called. From here on, the caller is the network:
you write endpoints, and something outside your process decides when to run
them, with what input, and what to do with what comes back. That shift is the
whole subject of this track, and it starts with the smallest possible version
of it — one route, one handler, one HTTP response.

There is a running ASP.NET Core application in this repository. It is real: it
has a `Program.cs`, an `appsettings.json`, a dependency-injection container and
a middleware pipeline, and `dotnet run` would serve it on a port. You will
never run it on a port, though, because the gate does something better. It
boots the *same* application in memory, wires an `HttpClient` straight into its
pipeline, and makes real requests through real routing and real model binding —
with no socket, no port, no flaky "is the server up yet" sleep. Your gate is an
integration test, and integration tests that fast are the reason .NET teams
write so many of them.

The second thing to get straight is where things live, because this track
splits a lesson across three places and the split is not arbitrary. Your *code*
lives in the web application, `src/Api/`, one folder per lesson — because
that's where the compiler and the web host need it. The *lesson* — this README,
the theory, the hints — lives under `lessons/00_hello_dojo/`. The *gate* lives
in `tests/Gates/`, which is exactly where tests live in every .NET repository
you will ever join.

So: **you edit files under `src/Api/`. You read files under `lessons/`. You
never edit `tests/Gates/`** — though you should absolutely read it, and it is
quoted verbatim at the bottom of this page.

## The loop

For this lesson the map is:

```
tracks/dotnet/
├── src/Api/
│   ├── Program.cs                     the composition root (you rarely touch it)
│   ├── LessonModules.cs               how a lesson's endpoints get wired up
│   └── L00_HelloDojo/                 <- YOU EDIT THESE
│       ├── Ex1.cs                        namespace DotnetDojo.Api.L00_HelloDojo
│       ├── Ex2.cs
│       └── Ex3.cs
├── tests/Gates/L00_HelloDojoTests.cs   <- the gate (read it, never edit it)
└── lessons/00_hello_dojo/             <- this README, reading.md, hints
```

The commands you will live in:

```
uv run dojo test dotnet 00_hello_dojo        # grade the whole lesson
uv run dojo test dotnet 00_hello_dojo ex2    # grade just one exercise
uv run dojo hint dotnet 00_hello_dojo ex2    # stuck? reveal the next tier
uv run dojo read dotnet 00_hello_dojo ex2    # the theory behind it
uv run dojo status dotnet                    # the progress dashboard
uv run dojo next dotnet                      # what should I do now?
```

`dotnet` also answers to `net`, so `uv run dojo test net 00 ex2` is the same
command with less typing.

Before you write a single line, run the gate and watch it fail:

```
uv run dojo test dotnet 00_hello_dojo
```

Three red tests. Each one made a real HTTP request, got a **500**, and printed
the response body — which is the `NotImplementedException` your stub threw,
because in the Development environment ASP.NET Core turns an unhandled
exception into a 500 whose body is the exception itself. That is the correct
state of a fresh checkout, and it is worth noticing that it is *not* a compiler
error: every stub in this course compiles, so a half-finished exercise never
breaks the lesson next to it.

## Concept — a route, a handler, a result

Here is a complete ASP.NET Core endpoint:

```csharp
app.MapGet("/hello", () => TypedResults.Ok(new { message = "hi" }));
```

Read it in three pieces, because each piece is a different job.

`MapGet("/hello", …)` is **routing**: it says that a `GET` whose path is
`/hello` should be handled here. There is a `MapPost`, a `MapPut`, a
`MapDelete` and a `MapPatch` too, and the HTTP method is part of the route —
`GET /hello` and `POST /hello` are two different endpoints that can live in two
different methods.

The lambda is the **handler**. ASP.NET Core calls it when the route matches,
and — this is the part that surprises people coming from Express or Flask — it
looks at your handler's *parameters* and fills them in for you. That is model
binding, and you will meet it in ex2 and ex3.

`TypedResults.Ok(value)` is the **result**: an object that knows how to write
itself onto the response. `Ok` means status 200 and serialise `value` as JSON.
There are siblings for every status code you care about — `TypedResults.NotFound()`,
`TypedResults.BadRequest()`, `TypedResults.NoContent()`, `TypedResults.Created(uri, value)` —
and you will use all of them in lesson 01. Returning a *result object* rather
than writing bytes to the response yourself is what keeps a handler testable:
it is a value you could inspect, not a side effect you have to observe.

In this course, handlers are written as named methods and passed to `MapGet`
as a method group, like this:

```csharp
public class Ex0 : IEndpointMapper
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/l00/example", Example);
    }

    private static IResult Example() => TypedResults.Ok(new { ok = true });
}
```

Two reasons. A named method has a signature you can read, which matters when
we start injecting services into it. And a lambda whose body is nothing but
`throw` has no return type for the compiler to infer, so the stubs would not
even build — which tells you something useful about how much of minimal-API
magic is really just C# overload resolution.

The `IEndpointMapper` wrapper is this course's own convention, not
ASP.NET Core's. `Program.cs` never grows a route per lesson; instead it asks
`LessonModules` to find every class in the assembly that implements
`IEndpointMapper` and call it. So the moment you write a mapper class, its
routes exist. Read `src/Api/LessonModules.cs` once — it is about forty lines
and there is nothing clever in it.

## Exercise 1 — your first endpoint

Edit `src/Api/L00_HelloDojo/Ex1.cs`. The route is already mapped; implement
`Ping` so that `GET /l00/ping` answers **200** with this JSON body:

```json
{"status":"ok","lesson":"00_hello_dojo"}
```

The file already declares `public record PingResponse(string Status, string Lesson)`
for you — return an `Ok` of one of those. Note that the C# properties are
`Status` and `Lesson` in PascalCase while the JSON comes out `status` and
`lesson` in camelCase; ASP.NET Core's JSON defaults do that conversion, and
you do not have to ask for it.

Every route in this track starts with the lesson's own prefix — `/l00/…` here,
`/l01/…` next lesson — so that lesson 07's `/orders` can never collide with
lesson 05's.

```
uv run dojo test dotnet 00_hello_dojo ex1
```

## Exercise 2 — read the query string, and say no

Edit `src/Api/L00_HelloDojo/Ex2.cs`. Implement `Echo` so that
`GET /l00/echo?message=hi` answers **200** with:

```json
{"message":"hi","length":2}
```

`length` is the number of characters in the message, so `?message=dojo` gives
`4`.

The handler signature is `Echo(string? message)`, and that parameter is already
bound to the `message` query-string value for you — the name matches, the type
is simple, so ASP.NET Core reads it out of the query. It is `string?` because
the caller might not send one at all.

When the message is missing, empty, or nothing but whitespace, answer **400
Bad Request** with no body. That is the honest status code: the request was
malformed, and the caller — not your server — is the one that has to change.
Returning a 200 with an empty string would be lying, and letting the handler
throw would be a 500, which blames you for their mistake.

```
uv run dojo test dotnet 00_hello_dojo ex2
```

## Exercise 3 — read a JSON request body

Edit `src/Api/L00_HelloDojo/Ex3.cs`. Implement `Greet` so that
`POST /l00/greetings` with the body `{"name":"Ada"}` answers **200** with:

```json
{"greeting":"Hello, Ada!"}
```

A whitespace-only or missing name is a **400**, exactly as in ex2.

The handler takes a `GreetingRequest request` — a complex type, so ASP.NET Core
binds it from the JSON request body rather than the query string. That rule is
worth memorising now: *simple types come from the route and query string,
complex types come from the body.* Nothing in the code says "read the body";
the parameter's type said it.

```
uv run dojo test dotnet 00_hello_dojo ex3
```

## The gate

This is the entire gate class, `tests/Gates/L00_HelloDojoTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;

namespace DotnetDojo.Gates;

public class L00_HelloDojoTests(DojoWebFactory factory) : IClassFixture<DojoWebFactory>
{
    [Fact]
    public async Task Ex1_PingReportsThatTheApiIsUp()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/l00/ping");

        await Teach.Status(HttpStatusCode.OK, response,
            "GET /l00/ping must answer 200 OK. A 500 here means the handler still throws; "
                + "a 404 means the route was never mapped - reread README ex1.");

        var body = await response.Content.ReadFromJsonAsync<PingDto>();
        Teach.Equal("ok", body?.Status,
            "The JSON body needs a \"status\" property whose value is exactly \"ok\".");
        Teach.Equal("00_hello_dojo", body?.Lesson,
            "The JSON body needs a \"lesson\" property whose value is exactly \"00_hello_dojo\".");
    }

    [Fact]
    public async Task Ex2_EchoReadsTheQueryStringAndRejectsAnEmptyOne()
    {
        using var client = factory.CreateClient();

        var ok = await client.GetAsync("/l00/echo?message=hi");
        await Teach.Status(HttpStatusCode.OK, ok,
            "GET /l00/echo?message=hi must answer 200 OK - reread README ex2.");

        var body = await ok.Content.ReadFromJsonAsync<EchoDto>();
        Teach.Equal("hi", body?.Message,
            "Echo the message back unchanged: the value came from the query string, "
                + "so it must not be hard-coded.");
        Teach.Equal(2, body?.Length,
            "\"length\" is the number of characters in the message - \"hi\" is 2.");

        var longer = await client.GetAsync("/l00/echo?message=dojo");
        var longerBody = await longer.Content.ReadFromJsonAsync<EchoDto>();
        Teach.Equal(4, longerBody?.Length,
            "\"dojo\" is 4 characters. A hard-coded 2 passes the first check and fails this one.");

        var missing = await client.GetAsync("/l00/echo");
        await Teach.Status(HttpStatusCode.BadRequest, missing,
            "GET /l00/echo with no message at all is the caller's mistake, so it is a 400, "
                + "not a 200 with an empty string and not a 500.");

        var blank = await client.GetAsync("/l00/echo?message=%20%20");
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A message of two spaces is blank too. Check for whitespace, not just for null.");
    }

    [Fact]
    public async Task Ex3_GreetingsReadsTheJsonRequestBody()
    {
        using var client = factory.CreateClient();

        var ok = await client.PostAsJsonAsync("/l00/greetings", new { name = "Ada" });
        await Teach.Status(HttpStatusCode.OK, ok,
            "POST /l00/greetings with {\"name\":\"Ada\"} must answer 200 OK - reread README ex3.");

        var body = await ok.Content.ReadFromJsonAsync<GreetingDto>();
        Teach.Equal("Hello, Ada!", body?.Greeting,
            "The body needs a \"greeting\" property equal to \"Hello, Ada!\" - comma, "
                + "exclamation mark and all.");

        var other = await client.PostAsJsonAsync("/l00/greetings", new { name = "Grace" });
        var otherBody = await other.Content.ReadFromJsonAsync<GreetingDto>();
        Teach.Equal("Hello, Grace!", otherBody?.Greeting,
            "The name has to come out of the request body, not be hard-coded.");

        var blank = await client.PostAsJsonAsync("/l00/greetings", new { name = "   " });
        await Teach.Status(HttpStatusCode.BadRequest, blank,
            "A whitespace-only name is not a name: answer 400.");
    }

    private sealed record PingDto(string? Status, string? Lesson);

    private sealed record EchoDto(string? Message, int? Length);

    private sealed record GreetingDto(string? Greeting);
}
```

In plain English: `factory.CreateClient()` boots the whole application in
memory and hands you an `HttpClient` plugged into its pipeline, so every
`GetAsync` below is a genuine request through routing, model binding and your
handler. `Teach.Status` asserts a status code and, when it does not match,
prints the body — which is where the real message usually is.
`Teach.Equal(expected, actual, why)` behaves like xUnit's `Assert.Equal` but
leads with the sentence telling you what to reread. Both live in
`tests/Gates/Teach.cs`; there is nothing clever in there.

Note the naming: the class is `L00_HelloDojoTests` and each method starts
`Ex1_`, `Ex2_`, `Ex3_`. That is how `uv run dojo test dotnet 00_hello_dojo ex2`
becomes a `dotnet test --filter` expression, and it is the convention every
lesson in this track follows.

Notice too what the gate never does: it does not reach into the container to
check that you registered something, and it does not call your handler methods
directly. It asks the same questions a client would ask — what status, what
headers, what body — which is why passing it means the endpoint really works,
not that it satisfied a test.

## The teaching point

The habit this lesson builds is **predicting the failure**. You ran the gate
before writing anything, so you know what red looks like; every red run from
here is a comparison, not a surprise. And you already know the three shapes of
red in this track: a 404 means the route never got mapped, a 500 means your
handler blew up, and a 200 with the wrong body means your logic is wrong. Those
three tell you where to look before you have read a single line of the diff.

The other habit is choosing the status code deliberately. You wrote a 400 twice
today, in both cases because the *caller* got it wrong. Most bugs in real APIs
are not crashes; they are a service that answers 200 to a request it did not
understand, and a client that carries on as if everything is fine.

Next: **01_routing_endpoints**, where routes get parameters, groups and every
result type you will need for a real resource.
