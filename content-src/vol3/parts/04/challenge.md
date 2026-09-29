@@PROMPT@@
## Challenge - classify, then retry only what is retryable

Edit `src/Lessons/V3CC04_ExceptionDesign/Challenge.cs`.

`FailurePipeline.RunAsync(IReadOnlyList<Func<int, CancellationToken,
Task<string>>> items, RetryPolicy policy, CancellationToken ct)` processes
every item, retrying the failures that deserve it.

`RetryPolicy(int MaxAttempts, int BaseDelayMs, int MaxDelayMs)` — the backoff
schedule is deterministic and computed, not slept: attempt `n` (1-based) waits
`min(BaseDelayMs * 2^(n-1), MaxDelayMs)` milliseconds, and the pipeline
**records** the schedule rather than sleeping, so the gate can assert it.

Classification, in this order:

1. `OperationCanceledException` with `ct` cancelled -> `Cancelled`. Never
   retried; the pipeline stops immediately and returns what it has.
2. `TransientException` with `StatusCode >= 500`, or `TimeoutException` ->
   `Transient`. Retried until `MaxAttempts` is reached.
3. Anything else -> `Permanent`. Never retried.

`PipelineReport`:

- `IReadOnlyList<string> Succeeded` — the values, in item order.
- `IReadOnlyList<int> DelaysMs` — every delay the schedule called for, in
  order, across all items.
- `int Attempts` — total invocations of any item.
- `AggregateException? Permanent` — every permanent failure, in item order,
  or null when there were none. Transient failures that exhausted their
  attempts are permanent failures too.
- `bool Cancelled`.

```
policy = new RetryPolicy(MaxAttempts: 3, BaseDelayMs: 100, MaxDelayMs: 500)

item succeeds on attempt 3 after two 5xx failures
  -> Succeeded ["ok"], DelaysMs [100, 200], Attempts 3, Permanent null

item always throws TransientException(503)
  -> Attempts 3, DelaysMs [100, 200], Permanent holds the last TransientException

item throws FormatException
  -> Attempts 1, DelaysMs [], Permanent holds the FormatException

caller cancels during item 2 of 4
  -> Cancelled true, items 3 and 4 never attempted
```

Honest difficulty note: the retry loop is ten lines and the *classification* is
the exercise. Write the three rules down, in order, before writing any code —
and note that rule 1 is checked before rule 2, so a cancellation that arrives
dressed as a timeout is still a cancellation.

```
uv run dojo test csharp v3cc04_exception_design challenge
```
@@HINTS@@
## Hint 1

Separate the two jobs completely. One function classifies an exception into
`Cancelled`, `Transient` or `Permanent` and does nothing else. Another runs the
loop and consults it. Mixing them gives you a `catch` chain that is also a
policy, which is unreadable and untestable.

## Hint 2

The schedule is arithmetic, so it needs no clock:

```csharp
static int DelayFor(RetryPolicy policy, int attempt) =>
    Math.Min(policy.BaseDelayMs * (1 << (attempt - 1)), policy.MaxDelayMs);
```

Recording the delays instead of sleeping is what makes the whole pipeline
testable in microseconds. A production version would `await
Task.Delay(delay, ct)` at the same point — and note that the `ct` there is what
makes a cancellation interrupt a backoff rather than waiting it out.

## Hint 3

The last attempt has no delay after it — a schedule of `[100, 200]` for three
attempts, not `[100, 200, 400]` — because you only wait when you are about to
try again. Off by one here is the most common bug in retry code, closely
followed by counting attempts as retries. Decide which you are counting, name
the variable accordingly, and the arithmetic stops fighting you.
@@IMPORTANT@@
## Hint 1

Ask what makes a failure retryable. Not its type, exactly: a 500 is retryable
and a 400 is not, though both are `HttpRequestException`. Retryability is
"would doing exactly this again plausibly succeed?" — which is a property of
the *cause*, and is why the classification needs structured data rather than a
type test.

## Hint 2

Retrying the wrong thing is worse than not retrying. A 400 retried three times
is three times the load for three identical failures; a non-idempotent request
retried after a timeout may run twice on the server. State that assumption:
this pipeline retries only operations that are safe to repeat, and a real one
would carry an idempotency key.

## Hint 3

Cancellation deserves its own path, not a `catch` at the end. When the caller's
token fires, the correct behaviour is to stop the whole pipeline — not to mark
this item failed and move on to the next one, which would do exactly the work
the caller asked you to abandon. Return what has succeeded so far, flag
`Cancelled`, and leave the remaining items untouched.
@@REF@@
// v3cc04_exception_design / challenge - classify, then retry only what is retryable.
// See lessons/v3cc04_exception_design/README.md, "Challenge".

namespace CSharpDojo.V3CC04_ExceptionDesign;

public readonly record struct RetryPolicy(int MaxAttempts, int BaseDelayMs, int MaxDelayMs);

public sealed record PipelineReport(
    IReadOnlyList<string> Succeeded,
    IReadOnlyList<int> DelaysMs,
    int Attempts,
    AggregateException? Permanent,
    bool Cancelled);

public enum FailureKind
{
    Cancelled,
    Transient,
    Permanent,
}

public static class FailurePipeline
{
    /// <summary>
    /// Classification, and nothing else. Order matters: a cancellation that
    /// arrives dressed as a timeout is still a cancellation.
    /// </summary>
    public static FailureKind Classify(Exception exception, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(exception);

        if (exception is OperationCanceledException && ct.IsCancellationRequested)
        {
            return FailureKind.Cancelled;
        }

        return exception switch
        {
            TransientException { StatusCode: >= 500 } => FailureKind.Transient,
            TimeoutException => FailureKind.Transient,
            _ => FailureKind.Permanent,
        };
    }

    /// <summary>Arithmetic, not a clock: BaseDelay * 2^(attempt-1), capped.</summary>
    public static int DelayFor(RetryPolicy policy, int attempt)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(attempt, 1);

        long raw = (long)policy.BaseDelayMs << (attempt - 1);
        return (int)Math.Min(raw, policy.MaxDelayMs);
    }

    public static async Task<PipelineReport> RunAsync(
        IReadOnlyList<Func<int, CancellationToken, Task<string>>> items,
        RetryPolicy policy,
        CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(items);
        ArgumentOutOfRangeException.ThrowIfLessThan(policy.MaxAttempts, 1);

        List<string> succeeded = new();
        List<int> delays = new();
        List<Exception> permanent = new();
        int attempts = 0;

        for (int index = 0; index < items.Count; index++)
        {
            Exception? lastTransient = null;

            for (int attempt = 1; attempt <= policy.MaxAttempts; attempt++)
            {
                attempts++;

                try
                {
                    succeeded.Add(await items[index](attempt, ct).ConfigureAwait(false));
                    lastTransient = null;
                    break;
                }
                catch (Exception ex)
                {
                    switch (Classify(ex, ct))
                    {
                        case FailureKind.Cancelled:
                            // Stop everything: continuing would do exactly the
                            // work the caller asked us to abandon.
                            return new PipelineReport(
                                succeeded,
                                delays,
                                attempts,
                                permanent.Count > 0 ? new AggregateException(permanent) : null,
                                Cancelled: true);

                        case FailureKind.Transient:
                            lastTransient = ex;

                            // Only wait when another attempt is coming: three
                            // attempts produce two delays, not three.
                            if (attempt < policy.MaxAttempts)
                            {
                                delays.Add(DelayFor(policy, attempt));
                            }

                            break;

                        default:
                            permanent.Add(ex);
                            lastTransient = null;
                            attempt = policy.MaxAttempts;   // no retry
                            break;
                    }
                }
            }

            if (lastTransient is not null)
            {
                // Exhausted its attempts, so it is now a permanent failure.
                permanent.Add(lastTransient);
            }
        }

        return new PipelineReport(
            succeeded,
            delays,
            attempts,
            permanent.Count > 0 ? new AggregateException("some items failed", permanent) : null,
            Cancelled: false);
    }
}
