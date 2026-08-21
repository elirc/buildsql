# Reading - dotnet/00_hello_dojo

The loop you just ran — write, grade, read the evidence — is the whole course.
This page is the other half of every lesson: the *why* behind the problems you
just solved. Read it **after** you attempt a problem, whether the gate went
green or red.

## Notes

**What actually happened when you ran the gate.** `dojo test dotnet` shells out
to `dotnet test`, which compiles `src/Api` into `Api.dll`, compiles
`tests/Gates` into `Gates.dll` (which references the first), and hands the test
assembly to xUnit. Then `DojoWebFactory` — a `WebApplicationFactory<Program>` —
runs your `Program.cs` for real, all the way to a built `WebApplication`, but
swaps the network transport for an in-memory one. `factory.CreateClient()`
returns an `HttpClient` whose message handler is that transport. No port is
opened, nothing is listening, and yet routing, model binding, dependency
injection, middleware and JSON serialisation all run exactly as they would in
production. That is why this course can grade a web application as
deterministically as it grades a pure function.

**Minimal APIs versus controllers.** What you wrote today is a *minimal API*:
routes declared with `MapGet`/`MapPost` and handlers that are plain methods.
The older MVC style puts handlers on a `Controller` class with `[HttpGet]`
attributes, discovered by convention. Both sit on the same routing, binding and
filter machinery, and both are fully supported; minimal APIs start smaller and
have less ceremony, controllers organise a large surface into classes and give
you model-validation attributes for free. Interviewers like asking which you
prefer — the answer they are listening for is that you know they share a
foundation, not that one is "modern" and the other "legacy".

**`Results` versus `TypedResults`.** `Results.Ok(x)` returns `IResult`;
`TypedResults.Ok(x)` returns the concrete `Ok<T>`, which still *is* an
`IResult`. The concrete type buys you two things: the compiler can check that
you returned what your signature promised, and ASP.NET Core can describe your
endpoint in OpenAPI without running it. Prefer `TypedResults` in new code. When
a handler can return more than one shape, `Results<Ok<Widget>, NotFound>` as
the return type keeps both benefits — you will use that in lesson 01.

**Async, everywhere, on purpose.** Every gate method here is
`async Task` and every call is awaited. That is not test ceremony: a web server
handles thousands of concurrent requests on a small pool of threads, and it can
only do that if a request that is waiting on a database or an HTTP call gives
its thread back. Blocking on `.Result` or `.Wait()` inside a handler takes that
thread out of circulation and, under load, is how a .NET service deadlocks
itself. "Async all the way down" is the phrase, and it is one of the most
common interview questions on this stack.

## ex1 - a route, a handler, a result

The smallest interesting thing in this exercise is that you never wrote any
JSON. You returned a `PingResponse` record and something turned it into
`{"status":"ok","lesson":"00_hello_dojo"}` — that something is
`System.Text.Json`, configured by ASP.NET Core with what it calls *web
defaults*: camelCase property names, case-insensitive reading, and numbers
written as numbers. The casing conversion is why the C# property `Status`
arrives at the client as `status`, and why the gate can read it back into a
record whose property is `Status` again.

The other thing worth noticing is that `Ping` returns `IResult` rather than a
`PingResponse`. You *could* have returned the record directly — ASP.NET Core
would serialise it and use 200 — but then the status code would be an
assumption rather than a decision, and there would be nowhere to put the 400
you needed one exercise later. Returning a result object means the status code
is part of the value your handler produces.

## ex2 - model binding, and the 400 that means "your fault"

`Echo(string? message)` reads from the query string because of a rule you can
state in one sentence: parameters of *simple* types (string, int, Guid,
DateTime, anything with a `TryParse`) are looked for in the route template
first and the query string second, while *complex* types come from the request
body. Nothing annotated anything. If you ever need to override that guess the
attributes exist — `[FromQuery]`, `[FromRoute]`, `[FromBody]`, `[FromHeader]`,
`[FromServices]` — and being explicit is not a sin, but knowing the default is
what lets you read other people's handlers.

The 400 is the part with real content. Four hundred means *the request was
wrong*; five hundred means *the server was wrong*. If your handler throws on a
missing query parameter, you have told the caller "my fault, try again later"
when the truth was "your fault, fix the request" — and every retry policy,
alert and error budget downstream of you now behaves incorrectly. Deciding
which side of that line a failure falls on is a judgement your framework cannot
make for you, and lesson 08 turns it into a policy.

`string.IsNullOrWhiteSpace` rather than `== null` is the small half of the
lesson: `?message=` sends an empty string, and `?message=%20` sends a space.
Both are "no message" to a human and neither is null.

## ex3 - the body, and where DTOs come from

Binding a JSON body into a record is one line of nothing — declare the
parameter, get the object — and that is exactly why it deserves a warning. The
type you bind is a *contract with the outside world*. It gets versioned by
clients you do not control, it can carry properties an attacker chose, and it
should never be the same type you persist. Lesson 07 makes that split explicit
under the name DTOs versus entities; today just notice that `GreetingRequest`
exists only to describe what arrives, and `GreetingResponse` exists only to
describe what leaves.

`request.Name` is `string?` for a reason: JSON is not the C# type system. A
client can send `{}`, or `{"name":null}`, or `{"name":123}`, and the first two
give you a null `Name` with no complaint at all. Nullable reference types are
telling you the truth here — the value really might be missing — and the
`IsNullOrWhiteSpace` check is not defensive programming, it is the validation
that turns an untrusted payload into a value your code can rely on.

## Further reading

- [Minimal APIs overview](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/overview) — the whole surface you will use for the next ten lessons, in one page.
- [Parameter binding in minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding) — the exact rules for what comes from the route, the query, the body and the container.
- [Create responses in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses) — `Results` versus `TypedResults`, and the full catalogue of result helpers.
- [Integration tests in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests) — `WebApplicationFactory`, which is the machinery behind every gate in this track.
- [The `dotnet test` command](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-test) — including `--filter`, which is how one exercise gets graded on its own.
