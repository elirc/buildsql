# Reading - dotnet/08_errors_logging

Observability is the part of a codebase that is invisible until the first
incident, at which point it is the only part that matters. This page is about
the two mechanisms ASP.NET Core gives you — a pipeline stage that turns
exceptions into responses, and a structured logging abstraction — and about the
judgement calls that neither of them makes for you.

## Notes

**What the framework already does.** In Development, `WebApplication` inserts
`DeveloperExceptionPageMiddleware`, which renders an unhandled exception as a
500 with the message, stack trace and request details in the body. That is why
every unimplemented stub in this course has told you exactly what was wrong. In
any other environment there is no such middleware, and an unhandled exception is
a bare 500 with an empty body — no leak, and no information for anyone. Neither
extreme is what you ship; the middle is what you just wrote.

**The built-in alternatives.** `app.UseExceptionHandler("/error")` re-executes
the pipeline against an error endpoint. `builder.Services.AddProblemDetails()`
plus `app.UseExceptionHandler()` gives you RFC 9457 responses for free, and also
makes the framework's own bare status codes (a routing 404, a binding 415) carry
a body. Since .NET 8 there is `IExceptionHandler`, a DI-registered interface with
a `TryHandleAsync` method, and you can register several — the first one that
handles the exception wins. That is the idiomatic modern shape; writing the
middleware by hand once, as you did, is how you understand what it is doing.

**Exceptions are for the exceptional.** Throwing is expensive — stack capture is
not free — and, more importantly, an exception used as ordinary control flow
loses its signal. If "the widget was not found" is a normal outcome of your
lookup, returning `null` and letting the handler answer 404 is clearer and
cheaper than throwing. The custom exceptions in this lesson exist because
sometimes the failure happens six frames down in a service that has no business
knowing about HTTP, and an exception is the only way back up.

**Never swallow.** `catch (Exception) { }` is how a system develops symptoms
with no cause. If you catch, either handle it (turn it into a response, as here)
or log it and rethrow. `throw;` preserves the original stack trace; `throw ex;`
resets it and destroys the evidence — a small syntactic difference with a large
consequence, and a favourite interview question.

**Scopes.** `using (logger.BeginScope("{OrderId}", id)) { … }` attaches a
property to every entry written inside the block, including from code deeper
down that knows nothing about orders. That is how a correlation id gets onto
every line of a request without being threaded through every method signature.
ASP.NET Core already opens a scope per request containing the request id.

**High-performance logging.** `logger.LogInformation("…{X}", x)` boxes value
types and allocates a params array on every call, even when the level is
disabled. For hot paths, the source-generated form —
`[LoggerMessage(Level = LogLevel.Information, Message = "Order {OrderId} shipped")]
static partial void OrderShipped(ILogger logger, int orderId);` — compiles to an
allocation-free call with a compile-time-checked template. Worth knowing exists;
not worth reaching for until something is hot.

**Health checks are the other half of operability.** `AddHealthChecks()` and
`MapHealthChecks("/healthz")` give the orchestrator a way to know whether to
route traffic to this instance. Out of scope here, one line to add.

## ex1 - which exception messages are safe to send

The rule is about *provenance*, not about the exception type. `NotFoundException("no such widget")`
carries a message you wrote, describing the caller's request, in language a
caller can act on — it is part of your API's contract, and sending it is fine.
`InvalidOperationException` came from somewhere you did not choose, carrying
whatever text a library author thought was useful for a developer reading a
stack trace. It might name a file path, a server, a table, or as here a
connection string with a password in it.

So: exceptions *you defined for this purpose* may speak to the client;
everything else gets a generic title and goes in the log. If you find yourself
wanting to relax that "just for this one third-party exception", you have
started maintaining an allowlist of other people's exception messages, which is
not a thing anybody can maintain.

The `catch (Exception)` at the bottom of the chain also has to be last. C#
matches catch blocks in order, and a `catch (Exception)` above a
`catch (NotFoundException)` makes the second unreachable — the compiler will
tell you, which is one of the nicer things about exception filters being typed.

The final detail is the successful request. A middleware whose `try` wraps
`await next(context)` and whose `catch` blocks are the only other code is
transparent when nothing throws — but it is easy to accidentally write one that
always writes a response, or that swallows the terminal's output. The gate checks
`/l08/mapped/fine` for exactly that reason.

## ex2 - the shape of a useful error log

`logger.LogError(ex, "Unhandled exception for {Path}", path)` has three parts
and each is load-bearing.

**The exception object, first, as its own argument.** The logging abstraction has
a dedicated slot for it, and every sink knows what to do with that slot: render
the stack trace, unwrap inner exceptions, group by exception type, symbolicate.
Interpolate the exception into the message instead and it becomes an opaque
string that no tool can do any of that with.

**The template.** `"Unhandled exception for {Path}"` is stable across every
request, so a sink can count occurrences of *this* failure. If the path were
interpolated, every request to a different URL would look like a different
problem.

**The property.** `Path` becomes a searchable field. In practice you would add
more — the method, the status code, the user id if you have one — and each one is
a dimension you can slice by later.

And note what the *response* does not have. This is the trade, stated plainly: a
client cannot debug your server, so giving it debugging information helps nobody
and helps attackers. Everything the client gets is a status code and an
identifier; everything else is in a place only you can read. Ex4 supplies the
identifier.

## ex3 - structured logging, and why it is not cosmetic

The two calls render the same characters. The difference is what arrives at the
sink.

Template form: `{ Level: "Information", MessageTemplate: "Order {OrderId} shipped to {City}", OrderId: 42, City: "Kyoto" }`.

Interpolated form: `{ Level: "Information", MessageTemplate: "Order 42 shipped to Kyoto" }`.

With the first you can ask: how many orders shipped to Kyoto this week; show me
every entry for order 42 across all six services; alert me when the rate of this
template drops. With the second you can grep, and every entry is its own unique
template, so any tool that groups by template sees a million distinct messages
and gives up.

The mistake is easy to make because C# makes interpolation so pleasant, and
because the analyzer that catches it (CA2254) is off by default. If you take one
mechanical habit from this lesson, make it: **the string passed to a logger is
always a literal with braces in it, never a `$"…"`.**

Two smaller points. The placeholders bind *positionally* — `{City}` gets the
second argument even if you named the variable `town` — so an argument in the
wrong order is a silent mislabelling. And PascalCase names are the convention
because they become property names in the sink.

## ex4 - correlation, and where distributed tracing takes it

The user-facing payoff is small and enormous: a support ticket that says "error
code 6b1e…" instead of "it broke around lunchtime". One string turns a search
through millions of entries into a lookup.

Echoing a client-supplied id rather than always generating one is what makes it
work across services. Service A generates an id, passes it in a header to
service B, which passes it to C; all three log it; one query returns the whole
story of one request through the system. That is exactly what W3C Trace Context
standardises — the `traceparent` header, which .NET's `System.Diagnostics.Activity`
already propagates automatically for you when you use `HttpClient`. In a modern
service you would lean on that and on OpenTelemetry rather than rolling your own
header, and `Activity.Current?.Id` is the id to log. Doing it by hand once makes
the machinery legible.

Setting the header before `await next(context)` rather than in the `catch` is
the ordering rule from lesson 03 wearing a new hat, twice over: successful
responses need the id too, and once the response has started you cannot add
headers anyway.

## challenge - log levels are an operational contract

The technical content is a third `catch` block. The real content is the decision
about levels, and it is the thing that separates a log you can operate from a
log you cannot.

Think about who is meant to *act*. A 404 means a client asked for something that
is not there; the action, if any, is "look at the trend, maybe someone's link is
broken". A 400 means a client sent something invalid; the action is "if this
spikes, a client shipped a bug". A 500 means *your* code did something it did
not intend; the action is "someone reads the stack trace today".

Log all three at Error and you have told your alerting system that a crawler
hitting a dead link deserves the same response as a null-reference in the
checkout path. Every team that does this ends up muting the channel, and the
muting is the real damage — the signal was there and nobody was listening.

The mirror-image mistake is logging genuine failures at Warning "so it doesn't
page anyone". Then the failure is invisible in exactly the way the alert was
meant to prevent.

Two more habits worth carrying out of here. Log the failure at the place that
*decides* it is a failure, once — a `catch`/log/rethrow at every layer produces
four entries for one event and quadruples your alert count. And never log
secrets, tokens, passwords or personal data: logs are usually retained longer,
copied more widely and secured less carefully than your database.

## Further reading

- [Handle errors in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) — the developer exception page, `UseExceptionHandler`, `IExceptionHandler` and `AddProblemDetails`.
- [Logging in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging) — providers, categories, levels and configuration-driven filtering.
- [Logging message templates](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging#log-message-template) — the exact behaviour of placeholders and why they are positional.
- [Compile-time logging source generation](https://learn.microsoft.com/en-us/dotnet/core/extensions/logger-message-generator) — `[LoggerMessage]`, for when logging is on a hot path.
- [Distributed tracing concepts](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-concepts) — `Activity`, W3C Trace Context, and where correlation ids go next.
