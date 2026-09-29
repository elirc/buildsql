@@PROMPT@@
## Exercise 7 - cancellation is not failure

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex7.cs`.

A caller giving up and an operation running out of time both arrive as
`OperationCanceledException`. Tell them apart.

`Outcome` is `"completed"`, `"cancelled"`, `"timedout"` or `"failed"`.

`Caller.Run(Func<CancellationToken, Task<string>> work, TimeSpan timeout,
CancellationToken callerToken)` returns `(Outcome Outcome, string? Value,
string? Error)`:

- Creates a timeout source with `CancelAfter` and links it to `callerToken`
  with `CancellationTokenSource.CreateLinkedTokenSource`.
- Passes the **linked** token to `work`.
- On success: `("completed", value, null)`.
- On `OperationCanceledException` when `callerToken.IsCancellationRequested`:
  `("cancelled", null, null)` — a caller giving up is not an error, so there
  is no message.
- On `OperationCanceledException` otherwise: `("timedout", null, $"timed out
  after {timeout.TotalMilliseconds:0}ms")`.
- On any other exception: `("failed", null, ex.Message)`.
- Both cancellation token sources are disposed.

`Caller.ShouldLogAsError(Outcome outcome)` returns true only for `"failed"` and
`"timedout"`.

```
Run(ct => Task.FromResult("ok"), 1s, none)             -> ("completed", "ok", null)
Run(ct => Forever(ct), 50ms, none)                      -> ("timedout", null, "timed out after 50ms")
Run(ct => Forever(ct), 10s, alreadyCancelledToken)      -> ("cancelled", null, null)
Run(ct => throw new IOException("disk"), 1s, none)      -> ("failed", null, "disk")
ShouldLogAsError("cancelled")                           -> false
```

```
uv run dojo test csharp v3cc04_exception_design ex7
```
@@HINTS@@
## Hint 1

The exception type cannot tell you what happened, because both causes throw the
same type. The *token* can: after catching, ask whether the caller's token is
the one that was cancelled. That single question is the whole exercise, and it
is why the linked source exists.

## Hint 2

The standard shape, with filters doing the classification:

```csharp
using var timeout = new CancellationTokenSource(duration);
using var linked = CancellationTokenSource.CreateLinkedTokenSource(callerToken, timeout.Token);
try { return await work(linked.Token); }
catch (OperationCanceledException) when (callerToken.IsCancellationRequested) { ... }
catch (OperationCanceledException) { /* must have been the timeout */ }
```

Order matters: the caller's cancellation is checked first, because if both
happened at once, the caller's intent is the more useful explanation.

## Hint 3

`TaskCanceledException` derives from `OperationCanceledException`, so catching
the base handles both — and catching only `TaskCanceledException` misses
cancellations raised by `token.ThrowIfCancellationRequested()`. Decide what
`Run` should do if `work` ignores the token and completes normally after the
timeout fired: the token was cancelled, but nothing threw, and returning
`"completed"` is defensible if you can say why.
@@IMPORTANT@@
## Hint 1

Start from the dashboard. Every client that closes a browser tab cancels a
request; if those are logged as errors, your error rate is a measure of user
impatience and nobody trusts it any more. Getting this classification right is
the difference between an alert that means something and one everybody mutes.

## Hint 2

Disposal matters here for a specific reason: a `CancellationTokenSource` with a
timer holds an entry in the timer queue, and a linked source registers a
callback on every token it links. Neither is released until you dispose:

```csharp
using var timeout = new CancellationTokenSource(duration);
using var linked = CancellationTokenSource.CreateLinkedTokenSource(a, b);
```

Two `using` declarations, disposed in reverse — the sector on deterministic
cleanup, showing up in the middle of an exception exercise.

## Hint 3

Think about what `Error` should contain in each case. For `"failed"` it is the
exception's message, because someone will need it. For `"timedout"` it is the
duration, because the exception's message ("A task was canceled.") tells nobody
anything. For `"cancelled"` it is null, because there is nothing to explain.
Three different answers to "what should the log line say" is the design content
of this exercise.
@@REF@@
// v3cc04_exception_design / ex7 - cancellation is not failure.
// See lessons/v3cc04_exception_design/README.md, "Exercise 7".

namespace CSharpDojo.V3CC04_ExceptionDesign;

public static class Caller
{
    /// <summary>
    /// Runs work under a timeout linked to the caller's own token, and
    /// classifies the outcome. Both causes throw OperationCanceledException;
    /// only the tokens can say which one happened.
    /// </summary>
    public static async Task<(string Outcome, string? Value, string? Error)> Run(
        Func<CancellationToken, Task<string>> work,
        TimeSpan timeout,
        CancellationToken callerToken)
    {
        ArgumentNullException.ThrowIfNull(work);

        // Both sources hold real resources - a timer queue entry and a
        // registration on each linked token - so both are disposed.
        using CancellationTokenSource timeoutSource = new(timeout);
        using CancellationTokenSource linked =
            CancellationTokenSource.CreateLinkedTokenSource(callerToken, timeoutSource.Token);

        try
        {
            string value = await work(linked.Token).ConfigureAwait(false);
            return ("completed", value, null);
        }
        catch (OperationCanceledException) when (callerToken.IsCancellationRequested)
        {
            // Checked first: if both fired at once, the caller's intent is the
            // more useful explanation. Not an error, so no message.
            return ("cancelled", null, null);
        }
        catch (OperationCanceledException)
        {
            // "A task was canceled." tells nobody anything; the duration does.
            return ("timedout", null, $"timed out after {timeout.TotalMilliseconds:0}ms");
        }
        catch (Exception ex)
        {
            return ("failed", null, ex.Message);
        }
    }

    /// <summary>
    /// A cancelled request is a user closing a tab. Logging it as an error
    /// makes the error rate a measure of impatience.
    /// </summary>
    public static bool ShouldLogAsError(string outcome) =>
        outcome is "failed" or "timedout";
}
