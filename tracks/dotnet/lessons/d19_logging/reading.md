# Reading - dotnet/d19_logging

## Notes

A log line is written once and read at three in the morning by somebody who
does not have your code open. Everything in this set follows from that: the
skill being drilled is producing entries that a **query** can find, at a level
that means something, containing what an investigator needs and nothing that
should never have left the building.

Four properties of a good entry, and one thing that must not be in it:

- **Structured.** `logger.LogInformation("Pick {PickId} started", id)` keeps
  `PickId` as a named value. `logger.LogInformation($"Pick {id} started")`
  renders identically and produces nothing queryable at all - the values are
  baked into one opaque sentence before the logger ever sees them.
- **At the right level.** The level is a claim about *whose problem this is*,
  not about the HTTP status. A caller's typo is Information. Something true
  about the world that somebody should know is a Warning. A promise the server
  failed to keep is an Error.
- **Correlated.** One value on every line that joins the error a user can see
  to the row you can find.
- **One per request.** Every extra line is a row in the store, a line on the
  bill, and something between the reader and the entry that matters.

And the thing that must not be in it: **anything secret**. A log store is
replicated, retained for years, and readable by far more people than the
database is. Logging a whole request object logs every field of it, including
the ones nobody thought about.

## ex1

What this was really testing: the difference between a message template and an
interpolated string - which is invisible in the console and total in the log
store. Both render "Pick 41 started for order SO-1001". Only one of them lets
you answer "show me every start for SO-1001" with a field match instead of a
substring search that breaks the day somebody rewords the sentence.

The classic mistake is exactly the shipped line, and it is easy to make because
`$"..."` is the idiom everywhere else in C#. Some teams ban interpolation in
logging calls with an analyzer for precisely this reason (CA2254).

The model answer's reasoning: pass the template *as the template* and the values
as arguments, and you get both halves - a readable sentence and named fields -
for the same number of characters.

## ex2

What this was really testing: that the level is not derived from the status
code. Two of these outcomes are 409s and they belong at different levels, which
is the whole point.

`Information` for a caller asking about a pick that does not exist, and for a
picker scanning the wrong item: neither is an incident, and logging them louder
is how an Error alert becomes noise nobody reads within a month. `Warning` for
an item the system promised and the shelf does not have: the request was
correct, and something true about the world is wrong.

The classic mistake is levelling by status - anything 4xx becomes a Warning,
anything 5xx an Error. It looks tidy and it destroys the signal, because a
client's typo and a stock discrepancy end up in the same bucket while the two
409s that mean completely different things stay indistinguishable.

## ex3

What this was really testing: that `ILogger` has a dedicated exception
parameter, and that flattening the exception into the message throws away
almost everything worth having. `logger.LogError(ex, "...")` preserves the
type, the stack trace and the inner exceptions; `"...: " + ex.Message` preserves
one string.

The second half is the same discipline as d18's ex4, from the logging side.
Everything you know about the exception belongs in the log; the client gets a
generic detail. The gate greps the response body for the printer token in the
exception message, because concatenating `ex.Message` into a `ProblemDetails`
detail is the most common way that token escapes.

The model answer's reasoning: catch, log with the exception object plus the one
property that identifies the work item, and answer with a sentence that names
nothing.

## ex4

What this was really testing: where a category comes from. `ILogger<Ex4>` asks
the framework for a logger whose category is that type's full name, and every
logging filter you will ever write - the `Logging.LogLevel` section of
`appsettings.json`, the query in your log tool - is written against exactly that
namespace-shaped string.

The classic mistake is `factory.CreateLogger("picking")`. It works, it reads
nicely, and it is a magic string that nobody renames when the class moves, does
not group with its neighbours, and cannot be turned up to Debug by namespace
when you are trying to see one subsystem.

Worth knowing: `ILogger<T>` is registered open-generic in the container, so
injecting it into a minimal API handler costs nothing and needs no registration
of your own.

## ex5

What this was really testing: that `{@Request}` is a loaded gun. Logging an
object logs every property it has - including the ones added next quarter by
somebody who never looked at your logging call.

The classic mistake is not laziness, it is a reasonable-sounding instinct: "log
the whole request so we have everything". You do have everything, including a
bearer token, in a store that is replicated to a search cluster, retained for
years, and readable by everyone with an operations login. Data-protection
reviews find these; so do breaches.

The model answer's reasoning: name the two fields worth keeping. If you do want
whole-object logging, that is what a destructuring policy or `[LogProperties]`
with `[LogPropertyIgnore]` from `Microsoft.Extensions.Telemetry` is for - an
explicit allowlist, not an accident.

## ex6

What this was really testing: log volume as a design decision. Six entries for
one request is not thoroughness; it is a reader having to reconstruct one event
from five fragments, at five times the ingest cost.

"Entering Complete" and "Leaving Complete" are what a debugger and a profiler
are for. The intermediate values - the line count, the item count - are not
separate events; they are fields of the one event that actually happened.

The classic mistake is adding a line each time something was hard to debug once,
and never removing any of them. The discipline that prevents it: **one entry per
outcome**, carrying every value the five removed lines were between them trying
to say.

## ex7

What this was really testing: all of the above at once, on a flow with five
outcomes, plus correlation. Five requests, five entries, four different levels
between them, and a `TraceId` on every one.

The trace id has to be per-**request**. `HttpContext.TraceIdentifier` is, and a
constant is not - a constant identifies the endpoint, which is precisely what a
correlation id must not do. The gate checks two requests produce two values for
exactly that reason.

Note the level assigned to the 400. A rejected request is Information: the
server did exactly what it should. Levelling validation failures as Warning is
common and wrong for the same reason as ex2 - it fills the Warning stream with
other people's typos until nobody looks at it.

## ex8

What this was really testing: whether the six habits hold together when they are
all required at once. Category from the class, one entry per request, named
properties, the right level per outcome, the exception object on the fault, a
trace id on every line, and no token anywhere in a response.

The interesting failure here is the shortage. It is a 409, like a client error,
and it is a **Warning**, like an operational problem - because that is what it
is: the request was valid, the pick exists, and the shelf disagrees with the
system. That combination is the one people get wrong, and it is the entry a
warehouse manager most wants to be able to count.

## Further reading

- [Logging in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging) - categories, levels, `ILogger<T>` and configuration by namespace.
- [Log message template guidance](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging#log-message-template) - templates, named placeholders, and why the values stay separate.
- [CA2254: Template should be a static expression](https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/quality-rules/ca2254) - the analyzer that catches ex1's mistake.
- [Logging guidance for .NET library authors](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging-library-authors) - what to log, at what level, and what never to.
- [Compile-time logging source generation](https://learn.microsoft.com/en-us/dotnet/core/extensions/logger-message-generator) - `[LoggerMessage]`, the allocation-free way to write everything in this set.
- [Distributed tracing concepts](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-concepts) - where a real correlation id comes from once there is more than one service.
