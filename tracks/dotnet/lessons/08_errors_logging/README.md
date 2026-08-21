# 08 — Errors and logging

Every lesson so far has been about the happy path and the failures you
*expected*: the 404 you wrote, the 400 you decided on. This lesson is about the
other kind — the exception nobody planned for — and about the second audience
your API has always had.

Because a failure has two audiences with opposite needs. The **client** needs an
answer it can act on: a status code, a machine-readable body, and nothing else,
because everything else is either useless to it or dangerous for you to send.
The **operator** — you, at three in the morning, six weeks from now — needs the
exception, the stack trace, the request path, and enough context to find the one
request out of a million that went wrong. Those two needs pull in opposite
directions, and the whole discipline is: *log the detail, return the generic.*

The default behaviour you have been relying on is neither. In Development,
ASP.NET Core turns an unhandled exception into a 500 whose body is the exception
text — which is why your stubs have been telling you exactly what went wrong all
course. That is a development convenience. In production it is a data leak with a
status code attached, and you have just written the code that proves it: this
lesson's `Trap.Handle` throws an `InvalidOperationException` whose message
contains a database password.

Read `src/Api/L08_ErrorsLogging/Domain.cs` first — it is given code, and it is
where the exceptions come from.

## Concept — ProblemDetails, and the shape of a log entry

### Turning an exception into a response

An exception-handling middleware is lesson 03's pattern with a `try` in it:

```csharp
public async Task InvokeAsync(HttpContext context)
{
    try
    {
        await next(context);
    }
    catch (SomethingExpectedException ex)
    {
        await Results.Problem(
                title: "Not Found",
                detail: ex.Message,
                statusCode: StatusCodes.Status404NotFound)
            .ExecuteAsync(context);
    }
}
```

Two things worth noticing. It has to be **outside** everything it protects —
lesson 03's review exercise again — because a middleware cannot catch an
exception thrown upstream of it. And `Results.Problem(...)` gives you an
`IResult`, which is not a return value here but something you *execute* against
the context with `ExecuteAsync`. That is the same object your handlers have been
returning all course; endpoints just have the framework execute it for them.

`Results.Problem` writes an RFC 9457 document with
`Content-Type: application/problem+json`:

```json
{"type":"…","title":"An unexpected error occurred.","status":500}
```

`Results.ValidationProblem(errors)` adds the `errors` object from lesson 07, and
both accept an `extensions:` dictionary for anything else you want to attach —
which is how ex4 puts a correlation id in the body.

### Message templates, not string interpolation

This is the single highest-value habit in the lesson:

```csharp
logger.LogInformation("Order {OrderId} shipped to {City}", id, city);     // yes
logger.LogInformation($"Order {id} shipped to {city}");                   // no
```

They render identically on a console. They are completely different things.

The first passes a **template** and two arguments, so the logging pipeline
receives structured state: `OrderId = 42`, `City = "Kyoto"`, plus the template
itself. Ship that to Seq, Elastic, Datadog or Application Insights and you can
query `OrderId = 42`, group by `City`, or alert when a template's rate spikes —
without parsing anything.

The second passes one finished string. The properties are gone, the template is
gone, and every entry looks unique, so nothing can be grouped. You have written
a `Console.WriteLine` with extra steps.

The placeholders are positional, not by name — `{OrderId}` takes the first
argument regardless of what the argument is called — and they are PascalCase by
convention because they become property names.

### Levels, and what they mean

| level | meaning | who cares |
|---|---|---|
| `Trace` / `Debug` | developer detail | you, locally |
| `Information` | something normal and noteworthy happened | audit, throughput |
| `Warning` | something is wrong but the system handled it | trends |
| `Error` | this request failed and someone should look | alerts |
| `Critical` | the system is failing | wake someone up |

The rule that keeps a log usable: **a 4xx caused by the caller is a Warning; a
5xx caused by you is an Error.** Log every 404 at Error and your alerting channel
fills with noise that is nobody's fault, and within a month the whole team has
muted it — at which point the real errors are invisible too. That is the
challenge.

### `ILogger<T>`

Inject `ILogger<MyMiddleware>` and the entry's *category* is the full type name,
which is what lets you turn logging up for one component and not the rest
(`"Logging:LogLevel:DotnetDojo.Api.L08_ErrorsLogging": "Debug"` in
`appsettings.json`, from lesson 04). A middleware takes it as a constructor
parameter — the middleware is a singleton and so is the logger, so there is no
captive dependency here.

## Exercise 1 — one middleware, three answers

Edit `src/Api/L08_ErrorsLogging/Ex1.cs`. Implement `ProblemDetailsMiddleware` so
that requests under `/l08/mapped/` are answered like this:

| thrown | response |
|---|---|
| `NotFoundException` | **404** ProblemDetails, `detail` = the exception's message |
| `ValidationFailedException` | **400** ProblemDetails, `detail` = the exception's message |
| anything else | **500** ProblemDetails, `title` = `An unexpected error occurred.`, and no `detail` at all |
| nothing | untouched — the terminal answers 200 `ok` |

The last row matters as much as the others: a middleware that wraps everything in
a `try` must still let successful requests through unchanged.

The two custom exceptions carry messages you wrote, about the caller's request,
so they are safe to send back. The third is an exception you did not anticipate,
whose message is whatever some library decided to put there — in this case a
connection string. The gate checks that `hunter2` does not appear in your
response.

```
uv run dojo test dotnet 08_errors_logging ex1
```

## Exercise 2 — log the detail, return the generic

Edit `src/Api/L08_ErrorsLogging/Ex2.cs`. Implement
`LoggingExceptionMiddleware` so that an unhandled exception under
`/l08/logged/`:

- answers **500** with a ProblemDetails whose title is
  `An unexpected error occurred.` and which reveals nothing else, **and**
- writes one **Error**-level log entry with the exception object passed to the
  logger, and the request path as a named property called `Path`

`logger.LogError(ex, "template {Path}", path)` — the exception goes *first*, as
its own argument, not interpolated into the message. That is what preserves the
stack trace, the inner exceptions and the type; a `LogError($"{ex}")` throws all
of it away and leaves you a string.

This exercise is the whole lesson in one method. The response is allowed to be
vague precisely *because* the log is not.

```
uv run dojo test dotnet 08_errors_logging ex2
```

## Exercise 3 — the template is the API

Edit `src/Api/L08_ErrorsLogging/Ex3.cs`. Implement
`POST /l08/orders/{id}/ship?city=…` so that it logs, at **Information**, that
this order shipped to this city — with `OrderId` and `City` as named properties —
and answers **200** with `{"orderId":42,"city":"Kyoto"}`.

The gate reads the captured log entry's structured state and checks that both
properties are there with the right values. An interpolated string produces a
perfectly readable message and *no properties at all*, which is exactly the
failure this gate exists to catch.

```
uv run dojo test dotnet 08_errors_logging ex3
```

## Exercise 4 — the id in the user's hand

Edit `src/Api/L08_ErrorsLogging/Ex4.cs`. Implement
`CorrelatedExceptionMiddleware` for `/l08/traced/`:

- give **every** request a correlation id — the one the client sent in
  `X-Correlation-Id`, or a fresh `Guid` — and put it on the response header,
  success or failure
- when the request throws, log at **Error** with the exception and the id as a
  named property called `CorrelationId`, and answer **500** with a ProblemDetails
  carrying an extension member `correlationId` holding the same value

The point is a straight line from a user saying "it said something went wrong,
here's the code on my screen" to the exact log entry. Without it, "an error
occurred" is unactionable and you are reduced to guessing from timestamps.

Note the ordering requirement hiding in "success or failure": the header has to
be set on the way *in*, before anything can throw, not in the `catch`.

```
uv run dojo test dotnet 08_errors_logging ex4
```

## Challenge — the whole failure policy, in one place

Honest difficulty note: it is ex1 and ex2 combined, plus one new decision per
branch. The new decision is the interesting part.

Edit `src/Api/L08_ErrorsLogging/Challenge.cs`. Implement
`FailurePolicyMiddleware` so that under `/l08/challenge/`:

| thrown | response | log |
|---|---|---|
| `NotFoundException` | 404 ProblemDetails | **Warning** |
| `ValidationFailedException` | 400 validation problem, `errors` keyed by the exception's `Field` | **Warning** |
| anything else | 500 ProblemDetails, no detail | **Error**, exception attached |

Every entry carries the request path as a named property called `Path`.

The levels are the exercise. Two of these are the caller getting it wrong, which
is a normal Tuesday for an API and belongs in a trend, not an alert. One of them
is your bug. A codebase that cannot tell those apart in its own logs cannot be
operated.

```
uv run dojo test dotnet 08_errors_logging challenge
```

## The gate

This is the entire gate class, `tests/Gates/L08_ErrorsLoggingTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DotnetDojo.Api.L08_ErrorsLogging;
using Microsoft.Extensions.Logging;

namespace DotnetDojo.Gates;

public class L08_ErrorsLoggingTests
{
    [Fact]
    public async Task Ex1_EachExceptionTypeBecomesItsOwnProblemDetails()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();

        var ok = await client.GetAsync("/l08/mapped/fine");
        await Teach.Status(HttpStatusCode.OK, ok,
            "A request that does not throw must still get through. A 500 here means the "
                + "middleware itself is throwing - reread README ex1.");

        var missing = await client.GetAsync("/l08/mapped/missing");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "NotFoundException means the caller asked for something that is not there: 404.");
        Teach.True(ContentType(missing).Contains("application/problem+json"),
            $"Answer with a ProblemDetails document. Got content type: {ContentType(missing)}");
        Teach.Equal("no such widget", await Field(missing, "detail"),
            "A NotFoundException's message is safe to show - it is about the caller's "
                + "request, not about your internals - so it belongs in \"detail\".");

        var invalid = await client.GetAsync("/l08/mapped/invalid");
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "ValidationFailedException means the caller sent something unusable: 400.");
        Teach.Equal("Name is required.", await Field(invalid, "detail"),
            "…and its message is the detail.");

        var boom = await client.GetAsync("/l08/mapped/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "An exception you did not plan for is a 500: the server is at fault.");
        Teach.Equal("An unexpected error occurred.", await Field(boom, "title"),
            "Unplanned failures get one generic title. The client cannot act on the "
                + "difference between two of your bugs.");

        string body = await boom.Content.ReadAsStringAsync();
        Teach.True(!body.Contains("hunter2") && !body.Contains("postgres://"),
            "The response is carrying the exception's message, which in this case contains a "
                + "database password. Never put an unplanned exception's text in a response - "
                + "log it instead.\n  body: " + body);
    }

    [Fact]
    public async Task Ex2_TheDetailIsLoggedAndTheResponseIsGeneric()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var boom = await client.GetAsync("/l08/logged/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "An unhandled exception is a 500 - reread README ex2.");

        string body = await boom.Content.ReadAsStringAsync();
        Teach.True(!body.Contains("hunter2"),
            "The secret is in the response body again. The client gets the generic title; "
                + "the operator gets the exception.\n  body: " + body);

        var errors = host.Logs.FromApi.Where(e => e.Level == LogLevel.Error).ToList();
        Teach.True(errors.Count > 0,
            "Nothing was logged at Error level by your code. A 500 that leaves no trace is a "
                + "bug nobody can investigate - and the whole reason the response is allowed "
                + "to be vague is that the log is not.\n" + host.Logs.Dump());

        var entry = errors[0];
        Teach.True(entry.Exception is InvalidOperationException,
            "The log entry has no exception attached. Pass the exception object as the first "
                + "argument - logger.LogError(ex, \"...\") - or you lose the stack trace, "
                + "which is the only part that says where the failure happened.\n  " + entry);
        Teach.True(entry.Exception?.Message.Contains("hunter2") == true,
            "The exception that reached the log is not the one that was thrown.");
        Teach.Equal("/l08/logged/boom", entry.Property("Path")?.ToString(),
            "The entry needs the request path as a named property called Path, so the log can "
                + "be searched by route.\n  " + entry);
    }

    [Fact]
    public async Task Ex3_TheMessageTemplateCarriesNamedProperties()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var response = await client.PostAsync("/l08/orders/42/ship?city=Kyoto", null);
        await Teach.Status(HttpStatusCode.OK, response,
            "POST /l08/orders/42/ship?city=Kyoto must answer 200 - reread README ex3.");

        var body = await response.Content.ReadFromJsonAsync<ShipDto>();
        Teach.Equal(42, body?.OrderId, "The response echoes the order id.");
        Teach.Equal("Kyoto", body?.City, "…and the city.");

        var entries = host.Logs.FromApi.Where(e => e.Level == LogLevel.Information).ToList();
        Teach.True(entries.Count > 0,
            "Nothing was logged at Information by your code.\n" + host.Logs.Dump());

        var entry = entries[0];
        Teach.True(entry.Has("OrderId") && entry.Has("City"),
            "The log entry has no OrderId and City properties, only a finished string. That "
                + "means you interpolated - $\"Order {id} shipped\" - instead of passing a "
                + "template and its arguments. An interpolated log line cannot be searched, "
                + "grouped or alerted on by field.\n  " + entry);
        Teach.Equal("42", entry.Property("OrderId")?.ToString(),
            "OrderId should be 42.");
        Teach.Equal("Kyoto", entry.Property("City")?.ToString(),
            "City should be Kyoto.");
        Teach.True(entry.Message.Contains("42") && entry.Message.Contains("Kyoto"),
            $"The rendered message should still read naturally. Got: {entry.Message}");
    }

    [Fact]
    public async Task Ex4_EveryFailureCarriesACorrelationId()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();
        host.Logs.Clear();

        var generated = await client.GetAsync("/l08/traced/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, generated,
            "An unhandled exception is still a 500 - reread README ex4.");

        string header = Header(generated, "X-Correlation-Id");
        Teach.True(header.Length > 0,
            "Every response needs an X-Correlation-Id header, including the failures - "
                + "especially the failures.");
        Teach.Equal(header, await Field(generated, "correlationId"),
            "The ProblemDetails document has to carry the same id as an extension member "
                + "called \"correlationId\", so a user can read it off the screen and an "
                + "engineer can find it in the log.");

        var errors = host.Logs.FromApi.Where(e => e.Level == LogLevel.Error).ToList();
        Teach.True(errors.Count > 0,
            "Nothing was logged at Error.\n" + host.Logs.Dump());
        Teach.Equal(header, errors[0].Property("CorrelationId")?.ToString(),
            "…and the log entry needs it as a named property called CorrelationId. That is "
                + "the whole point: the id in the client's hand finds the entry in the "
                + "log.\n  " + errors[0]);

        var supplied = new HttpRequestMessage(HttpMethod.Get, "/l08/traced/boom");
        supplied.Headers.Add("X-Correlation-Id", "trace-me");
        var echoed = await client.SendAsync(supplied);
        Teach.Equal("trace-me", Header(echoed, "X-Correlation-Id"),
            "When the client supplies an id, echo it instead of inventing one - that is how "
                + "one request is followed across several services.");
        Teach.Equal("trace-me", await Field(echoed, "correlationId"),
            "…and the body agrees with the header.");

        var fine = await client.GetAsync("/l08/traced/fine");
        await Teach.Status(HttpStatusCode.OK, fine,
            "A request that does not throw still succeeds.");
        Teach.True(Header(fine, "X-Correlation-Id").Length > 0,
            "…and still gets a correlation id. Set it on the way in, not in the catch block.");
    }

    [Fact]
    public async Task Challenge_OneMiddlewareDecidesStatusBodyAndLogLevel()
    {
        using var host = new CapturingHost();
        using var client = host.CreateClient();

        host.Logs.Clear();
        var missing = await client.GetAsync("/l08/challenge/missing");
        await Teach.Status(HttpStatusCode.NotFound, missing,
            "NotFoundException is a 404 - reread README challenge.");
        Teach.Equal("Warning", LevelOfFirstApiEntry(host),
            "A 404 is the caller's mistake, not an incident. Log it at Warning - logging "
                + "every 404 at Error is how an alerting channel becomes noise everyone "
                + "ignores.\n" + host.Logs.Dump());

        host.Logs.Clear();
        var invalid = await client.GetAsync("/l08/challenge/invalid");
        await Teach.Status(HttpStatusCode.BadRequest, invalid,
            "ValidationFailedException is a 400.");
        Teach.Equal("name", await ErrorKeys(invalid),
            "The 400 is a validation problem whose \"errors\" object is keyed by the "
                + "exception's Field, so the client can point at the offending input.");
        Teach.Equal("Warning", LevelOfFirstApiEntry(host),
            "A rejected payload is also Warning, not Error.\n" + host.Logs.Dump());

        host.Logs.Clear();
        var boom = await client.GetAsync("/l08/challenge/boom");
        await Teach.Status(HttpStatusCode.InternalServerError, boom,
            "Anything unplanned is a 500.");
        Teach.Equal("Error", LevelOfFirstApiEntry(host),
            "This one really is an incident: Error, with the exception attached.\n"
                + host.Logs.Dump());

        var entry = host.Logs.FromApi.First();
        Teach.True(entry.Exception is InvalidOperationException,
            "Pass the exception to the logger so the stack trace survives.\n  " + entry);
        Teach.Equal("/l08/challenge/boom", entry.Property("Path")?.ToString(),
            "Every entry carries the request path as a named property called Path.\n  " + entry);

        string body = await boom.Content.ReadAsStringAsync();
        Teach.True(!body.Contains("hunter2"),
            "…and the client still learns nothing about your internals.\n  body: " + body);

        var fine = await client.GetAsync("/l08/challenge/fine");
        await Teach.Status(HttpStatusCode.OK, fine,
            "A request that does not throw is untouched by any of this.");
    }

    private static string LevelOfFirstApiEntry(CapturingHost host)
    {
        var entries = host.Logs.FromApi;
        return entries.Count == 0 ? "(nothing logged)" : entries[0].Level.ToString();
    }

    private static async Task<string> Field(HttpResponseMessage response, string name)
    {
        string body = await response.Content.ReadAsStringAsync();
        try
        {
            using var document = JsonDocument.Parse(body);
            return document.RootElement.TryGetProperty(name, out var value)
                ? value.ToString()
                : $"(no \"{name}\" in {body})";
        }
        catch (JsonException)
        {
            return $"(not JSON: {body})";
        }
    }

    private static async Task<string> ErrorKeys(HttpResponseMessage response)
    {
        string body = await response.Content.ReadAsStringAsync();
        try
        {
            using var document = JsonDocument.Parse(body);
            if (!document.RootElement.TryGetProperty("errors", out var errors))
            {
                return $"(no \"errors\" property; body was {body})";
            }

            return string.Join(",", errors.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        }
        catch (JsonException)
        {
            return $"(not JSON: {body})";
        }
    }

    private static string ContentType(HttpResponseMessage response) =>
        response.Content.Headers.ContentType?.ToString() ?? "";

    private static string Header(HttpResponseMessage response, string name) =>
        response.Headers.TryGetValues(name, out var values) ? string.Join(",", values) : "";

    private sealed record ShipDto(int OrderId, string? City);
}
```

In plain English: `CapturingHost` is `WebApplicationFactory` with an
`ILoggerProvider` bolted on that keeps every entry the application writes,
including its structured state. That is what lets these gates assert on the
*log* and not only on the response — which is the only way to grade "log the
detail, return the generic", because by definition the detail is not in the
response. It is also a technique worth stealing: asserting that your service
logged what it should is a perfectly ordinary thing to test.

## The teaching point

Two audiences, opposite needs, one rule: **the response is for the client, the
log is for you.** Every time you are tempted to put an exception message in a
response body "so it's easier to debug", remember that you are choosing to debug
from the client's screen rather than from your logs, and that the same string
will be visible to everyone else's client too.

The second habit is that a log entry is a *record with fields*, not a sentence.
Templates instead of interpolation, one named property per thing you might
later want to search by, and a level that reflects who needs to act. Do that and
your logs are a queryable dataset; skip it and they are a wall of text you grep
in a crisis.

Next: **09_auth_and_testing**, the capstone — who the caller is, what they are
allowed to do, and how to test an endpoint that demands a token.
