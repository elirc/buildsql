# V3·C4 — Exceptions: designing them, throwing them, and what they cost

## The question behind the mechanics

Every codebase has `try` and `catch` in it. Very few have a defensible answer
to "why is this an exception and that a return value?", "what is a caller
supposed to do with this?", and "how much is this costing us?". This sector is
those three questions.

The one-line version: **an exception is an API**, and it should be designed
like one — a type callers can catch, data callers can branch on, a message a
human can act on, and a frequency low enough that its cost does not matter.

## Designing the type

```csharp
public sealed class ImportFailedException : Exception
{
    public ImportFailedException(string message)
        : base(message) { }

    public ImportFailedException(string message, Exception inner)
        : base(message, inner) { }

    public required int Line { get; init; }
    public required string Field { get; init; }
}
```

- **Sealed** unless you have a specific reason for a hierarchy.
- **The message-and-inner constructor is not optional.** Without it you cannot
  wrap without destroying evidence.
- **Structured properties**, so the caller does not parse the message.
- Name it after the failure, ending in `Exception`.
- Do not create a base `AppException` that everything derives from. Callers end
  up catching it, which is `catch (Exception)` wearing a hat.

Legacy note: `[Serializable]` and the `(SerializationInfo, StreamingContext)`
constructor were once mandatory. Binary serialisation is obsolete in modern
.NET and you should not add them to new types.

## Guards, in one line each

```csharp
ArgumentNullException.ThrowIfNull(source);
ArgumentException.ThrowIfNullOrWhiteSpace(name);
ArgumentOutOfRangeException.ThrowIfNegativeOrZero(count);
ArgumentOutOfRangeException.ThrowIfGreaterThan(page, maxPage);
ObjectDisposedException.ThrowIf(disposed, this);
```

All of them use `CallerArgumentExpression` to capture the argument's *source
text* as the parameter name, so the exception says `source` without you writing
`nameof(source)` — and stays correct when the parameter is renamed.

Your own version, for a domain rule:

```csharp
internal static class Require
{
    public static void Positive(decimal value,
        [CallerArgumentExpression(nameof(value))] string? expression = null)
    {
        if (value <= 0) ThrowNotPositive(value, expression);
    }

    [DoesNotReturn]
    private static void ThrowNotPositive(decimal value, string? expression) =>
        throw new ArgumentOutOfRangeException(expression, value, "must be positive");
}
```

`[DoesNotReturn]` tells the compiler's flow analysis that code after the call
is unreachable — so nullable analysis stays happy — and keeping the `throw` in a
separate method keeps the caller small enough for the JIT to inline.

## Filters, and what they buy

```csharp
try
{
    Send(request);
}
catch (HttpRequestException ex) when (ex.StatusCode >= HttpStatusCode.InternalServerError)
{
    Retry();
}
```

Two properties, both useful. First, the filter is evaluated **before the stack
unwinds**, so if it returns false the exception continues untouched — same
object, same trace — which a `catch` followed by `throw;` cannot claim. Second,
the condition is data, not string matching: filtering on `ex.Message.Contains(...)`
breaks the day someone rewords a message or the process runs in another
locale.

## The Try pattern, done properly

```csharp
// One core. It returns an outcome; it does not throw.
private static bool TryCore(string text, out int value, out string? error) { ... }

public static int Parse(string text) =>
    TryCore(text, out int value, out string? error)
        ? value
        : throw new FormatException(error);

public static bool TryParse(string text, out int value) =>
    TryCore(text, out value, out _);
```

The anti-pattern is `TryParse` implemented as `try { Parse(); } catch { return
false; }`. It works, and it costs microseconds per failure — so a validation
loop over ten thousand user-supplied rows spends a tenth of a second in the
exception machinery for outcomes you fully expected.

## What a throw costs

| Operation | Order of magnitude |
| --- | --- |
| Method call returning a bool | ~1 ns |
| `TryParse` on a bad input | tens of ns |
| Throw caught one frame up | ~5-10 microseconds |
| Throw caught twenty frames up | tens of microseconds |
| Throw crossing an `async` boundary | more again |

Stack trace capture dominates, and it scales with stack depth. The practical
reading: one exception per failed *request* is free at any realistic scale; one
exception per *row*, *item* or *iteration* is a performance bug.

## Choosing the channel

| Situation | Channel | Why |
| --- | --- | --- |
| User typed letters into a number field | return / `Try` | Expected, and frequent |
| Record not found by id | return / nullable | Expected; the caller decides if it matters |
| Business rule rejected the request | `Result<T>` or a validation object | Expected, and there may be several |
| Argument is null or out of range | throw | A bug in the caller, and it should stop |
| Object used after disposal | throw | A bug in the caller |
| Database is unreachable | throw | Unexpected, and nothing local can fix it |
| Config file is malformed at startup | throw | Fail fast, loudly, before serving traffic |
| Caller cancelled | `OperationCanceledException` | The convention, and not an error |

The pattern in the table: **exceptions for bugs and for genuinely
unexpected environmental failures; returns for outcomes that are part of
normal operation.** Frequency is the tiebreaker — if it happens per item rather
than per request, it is not exceptional, whatever it feels like.

## Common mistakes

- `catch (Exception) { }` — swallowing. If you must catch broadly, log with the
  full exception and rethrow or fail the operation.
- `throw ex;` — resets the stack trace. Use `throw;`.
- Wrapping without passing the inner exception.
- Using exceptions for expected outcomes: not-found, validation failure, a
  user typing letters into a number field.
- Catching `Exception` to convert it into a `bool`, discarding what happened.
- Logging *and* rethrowing at every layer, producing five log entries per
  failure and no clearer picture.
- Treating `OperationCanceledException` as an error.
- Argument validation inside an `async` method body, which faults the task
  instead of throwing synchronously — split it into a non-async wrapper if
  callers depend on the synchronous throw.
- `catch (AggregateException)` around `await`. `await` unwraps to the first
  inner exception; the aggregate only appears if you use `.Result` or `.Wait()`.

## Interview answer

*"When should you throw an exception?"* — When the operation cannot complete
and the caller cannot reasonably have expected it: a dependency is down, an
invariant is broken, an argument is invalid. Not for outcomes that are part of
normal operation — not-found, validation failures, parse failures on user input
— because those are expected, and because a throw costs microseconds against
nanoseconds for a return, which matters the moment the failure is per-item
rather than per-request.

*"How do you design an exception type?"* — Specific type so callers can catch
precisely, structured properties so they do not parse the message, the
message-and-inner constructor so wrapping preserves the cause, sealed unless a
hierarchy is genuinely needed, and no shared base class that everyone ends up
catching.

## Check yourself

1. What are the three surfaces of an exception, and who consumes each?
2. Why is a single `AppException` with a code property a bad design?
3. What does `CallerArgumentExpression` do for `ArgumentNullException.ThrowIfNull`?
4. Why does the BCL put its throws in separate `[DoesNotReturn]` methods?
5. What can a `when` filter observe that a `catch` followed by `throw;` cannot?
6. Why is filtering on `ex.Message` fragile?
7. Write the two-line difference between `throw;` and `throw ex;` in terms of
   what a caller's log shows.
8. When is `ExceptionDispatchInfo.Capture(ex).Throw()` the right tool?
9. An `async` method validates an argument and throws before its first
   `await`. Does the caller see a synchronous throw?
10. `await Task.WhenAll(t1, t2, t3)` and two tasks failed. How many exceptions
    does `await` throw, and where are the others?
11. How do you tell a caller's cancellation from a timeout when both arrive as
    `OperationCanceledException`?
12. Roughly how much more expensive is a caught throw than a returned bool?
13. Why is `TryParse` implemented as catch-around-`Parse` a bug rather than a
    style choice?
14. Where exactly should a `Result<T>`-based codebase convert exceptions into
    results, and why exactly once?
