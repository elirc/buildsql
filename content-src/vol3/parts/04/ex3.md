@@PROMPT@@
## Exercise 3 - filters decide before unwinding

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex3.cs`.

`TransientException(string message, int statusCode)` carries a status code as
*data*, so handlers never parse messages.

`Gateway.Call(Func<string> work, List<string> log)`:

- Runs `work` inside a `try` whose `finally` appends `"callee:finally"`.
- Catches `TransientException` **when** `StatusCode` is 500 or above, logs
  `"handled:{StatusCode}"` and returns `"retry"`.
- Any other exception, including a `TransientException` with a status below
  500, propagates untouched.
- On success returns the work's result.

`Gateway.Observe(Func<string> work, List<string> log)` demonstrates the
ordering. It calls the same inner worker directly, and its `try` has **two**
catch clauses: the first appends `"filter:evaluated"` in its filter and then
returns `false`, declining; the second is the real handler, catching a
`TransientException` of 500 or above and logging `"handled:{StatusCode}"`. A
filter on the first clause is what makes that second, more specific clause
legal.

Because filters run before the stack unwinds, the log order is:

```
Observe(() => throw new TransientException("gone", 503), log)
log -> ["filter:evaluated", "callee:finally", "handled:503"]
```

`filter:evaluated` comes **first**, before the callee's `finally`. That is the
two-pass model, observable.

```
Call(() => "ok", log)                                  -> "ok"
Call(() => throw new TransientException("x", 503), log) -> "retry"
Call(() => throw new TransientException("x", 404), log) -> throws
Call(() => throw new FormatException(), log)            -> throws
```

```
uv run dojo test csharp v3cc04_exception_design ex3
```
@@HINTS@@
## Hint 1

A filter answers "is this mine?" without taking the exception. If it says no,
the exception carries on completely untouched — same object, same stack trace,
still in flight — which a `catch` followed by `throw;` cannot claim, because
that one has already unwound to your frame.

## Hint 2

The filter is an expression after `when`, and it can call anything:

```csharp
catch (TransientException ex) when (ex.StatusCode >= 500)
{
    ...
}

catch (Exception ex) when (Log(ex))   // Log returns false: observe, do not handle
{
}
```

The second form is the side-effecting filter. It logs every exception passing
through this frame without catching any of them, and it is either elegant or
too clever depending on your team.

## Hint 3

To get the ordering the gate expects, the filter must be *above* the frame
containing the `finally`, and no frame in between may accept the exception
first — the search pass stops at the first clause that says yes. So put both
catch clauses in `Observe`, and let the inner worker contribute only its
`finally`. Predict the order before running it; if your prediction was wrong,
work out which pass you forgot about.
@@IMPORTANT@@
## Hint 1

Start from the alternative and notice what it costs:

```csharp
catch (TransientException ex)
{
    if (ex.StatusCode < 500) throw;    // already unwound; trace preserved but frames gone
    ...
}
```

This works and it has thrown away the state between the throw site and here.
With a filter, an exception you decline never knows you looked.

## Hint 2

Filter on data, never on text:

```csharp
catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)  // good
catch (Exception ex) when (ex.Message.Contains("timeout"))                              // fragile
```

Messages get reworded, localised, and wrapped. A status code, an error number
or an exception type does not.

## Hint 3

Watch what happens if a filter itself throws: the runtime swallows that
exception and treats the filter as having returned false. So a filter must be
cheap and total — no I/O, no allocation-heavy work, no calls that can fail.
Decide whether your `Log` helper meets that bar, and say why.
@@REF@@
// v3cc04_exception_design / ex3 - filters decide before unwinding.
// See lessons/v3cc04_exception_design/README.md, "Exercise 3".

namespace CSharpDojo.V3CC04_ExceptionDesign;

/// <summary>
/// The status code is a property, not a substring of the message: handlers
/// branch on data that cannot be reworded or localised out from under them.
/// </summary>
public sealed class TransientException : Exception
{
    public TransientException(string message, int statusCode)
        : base(message) => StatusCode = statusCode;

    public TransientException(string message, int statusCode, Exception inner)
        : base(message, inner) => StatusCode = statusCode;

    public int StatusCode { get; }
}

public static class Gateway
{
    public static string Call(Func<string> work, List<string> log)
    {
        ArgumentNullException.ThrowIfNull(work);
        ArgumentNullException.ThrowIfNull(log);

        try
        {
            return Invoke(work, log);
        }
        catch (TransientException ex) when (ex.StatusCode >= 500)
        {
            // A 404 declines this filter and propagates untouched, which is
            // the correct behaviour: retrying a not-found never helps.
            log.Add($"handled:{ex.StatusCode}");
            return "retry";
        }
    }

    /// <summary>
    /// Shows the two-pass model. Both catch clauses live in THIS frame, above
    /// Invoke's finally: the search pass evaluates the logging filter first,
    /// the unwind pass then runs the callee's finally, and only then does the
    /// chosen handler body run.
    /// </summary>
    public static string Observe(Func<string> work, List<string> log)
    {
        ArgumentNullException.ThrowIfNull(work);
        ArgumentNullException.ThrowIfNull(log);

        try
        {
            return Invoke(work, log);
        }
        catch (Exception) when (Note(log, "filter:evaluated"))
        {
            // Never reached: Note returns false, so this clause declines and
            // the search pass moves on to the next one. Legal despite the
            // more-specific catch below because this one has a filter.
            log.Add("outer:caught");
            return "outer";
        }
        catch (TransientException ex) when (ex.StatusCode >= 500)
        {
            log.Add($"handled:{ex.StatusCode}");
            return "retry";
        }
    }

    private static string Invoke(Func<string> work, List<string> log)
    {
        try
        {
            return work();
        }
        finally
        {
            // Runs during the unwind pass - after any filter further up.
            log.Add("callee:finally");
        }
    }

    /// <summary>
    /// A side-effecting filter: observes without handling. Cheap and total,
    /// because a filter that throws is swallowed and treated as false.
    /// </summary>
    private static bool Note(List<string> log, string entry)
    {
        log.Add(entry);
        return false;
    }
}
