@@PROMPT@@
## Exercise 6 - what async does to a failure

Edit `src/Lessons/V3CC04_ExceptionDesign/Ex6.cs`.

Three things `async` changes about failure, each with a method that proves it.

- `AsyncFailures.ValidateThenWork(string? input)` is `async Task<int>` and
  validates `input` at the top with `ArgumentNullException.ThrowIfNull`. The
  gate calls it **without awaiting** and asserts the call itself does not throw
   — the returned task is faulted instead.
- `AsyncFailures.ValidateEagerly(string? input)` is a *non-async* method that
  validates synchronously and then calls a private `async` core, so the
  argument exception is thrown at the call.
- `AsyncFailures.FirstFailureOf(params Func<Task>[] work)` awaits
  `Task.WhenAll` and returns the type name of the exception `await` produced —
  one, even when several tasks failed.
- `AsyncFailures.AllFailuresOf(params Func<Task>[] work)` returns every failure,
  in task order, as a list of type names, by reading the aggregated task's
  `Exception` rather than relying on `await`.

```
Task<int> t = ValidateThenWork(null);      // no throw here
t.IsFaulted                                 -> true (after it completes)
await t                                     -> throws ArgumentNullException

ValidateEagerly(null)                       -> throws ArgumentNullException immediately

await FirstFailureOf(Boom<FormatException>, Boom<OverflowException>)
  -> "FormatException"
await AllFailuresOf(Boom<FormatException>, Boom<OverflowException>)
  -> ["FormatException", "OverflowException"]
```

```
uv run dojo test csharp v3cc04_exception_design ex6
```
@@HINTS@@
## Hint 1

An `async` method's body runs inside a state machine, and everything that
escapes it — including code before the first `await` — is captured into the
returned task rather than thrown at the caller. That is the whole of the first
surprise, and it explains why the BCL splits validation out of `async` methods
so often.

## Hint 2

The eager-validation split, which is the standard fix:

```csharp
public static Task<int> ValidateEagerly(string? input)
{
    ArgumentNullException.ThrowIfNull(input);    // throws at the call site
    return Core(input);

    static async Task<int> Core(string text) { await Task.Yield(); return text.Length; }
}
```

The outer method is not `async`, so its throw is synchronous; the inner local
function carries the awaits.

## Hint 3

For the aggregate, remember that `await` unwraps to the *first* exception while
the task keeps all of them:

```csharp
Task all = Task.WhenAll(tasks);
try { await all; }
catch { /* one exception */ }
AggregateException? every = all.Exception;   // all of them, flattened with Flatten()
```

Decide whether to read `all.Exception` after catching, or to inspect each task
individually — both work, and only one keeps the original task order reliably.
@@IMPORTANT@@
## Hint 1

Ask what a caller can even do with a faulted task they never awaited. Nothing
useful — and if they abandon it, the exception used to crash the process on
finalization and now goes quietly unobserved. That is the practical reason
argument validation should be eager: the failure reaches the caller at the
moment they made the mistake.

## Hint 2

The two entry points look identical from outside and differ in one keyword:

```csharp
public static async Task<int> A(string? s) { ArgumentNullException.ThrowIfNull(s); ... }
public static Task<int> B(string? s)       { ArgumentNullException.ThrowIfNull(s); ... }
```

`A` returns a faulted task; `B` throws. Neither is wrong in general — but for
argument validation the second is the documented convention, and for anything
that happens *during* the operation the first is correct.

## Hint 3

`AggregateException.Flatten()` matters more than it looks. `Task.WhenAll` over
tasks that themselves came from `WhenAll` gives you nested aggregates, and
`InnerExceptions` on the outer one then contains aggregates rather than the
real failures. Flatten first, then read, and decide whether your ordering
guarantee survives it — it may be safer to walk the original tasks.
@@REF@@
// v3cc04_exception_design / ex6 - what async does to a failure.
// See lessons/v3cc04_exception_design/README.md, "Exercise 6".

namespace CSharpDojo.V3CC04_ExceptionDesign;

public static class AsyncFailures
{
    /// <summary>
    /// Async all the way, so even the validation at the top faults the
    /// returned task instead of throwing at the call site.
    /// </summary>
    public static async Task<int> ValidateThenWork(string? input)
    {
        ArgumentNullException.ThrowIfNull(input);

        await Task.Yield();
        return input.Length;
    }

    /// <summary>
    /// The documented convention for argument validation: a non-async wrapper
    /// throws synchronously, and a local function carries the awaits.
    /// </summary>
    public static Task<int> ValidateEagerly(string? input)
    {
        ArgumentNullException.ThrowIfNull(input);

        return Core(input);

        static async Task<int> Core(string text)
        {
            await Task.Yield();
            return text.Length;
        }
    }

    /// <summary>
    /// await unwraps to the first exception, however many tasks failed.
    /// </summary>
    public static async Task<string> FirstFailureOf(params Func<Task>[] work)
    {
        ArgumentNullException.ThrowIfNull(work);

        Task[] tasks = work.Select(w => w()).ToArray();
        try
        {
            await Task.WhenAll(tasks);
        }
        catch (Exception ex)
        {
            return ex.GetType().Name;
        }

        return "none";
    }

    /// <summary>
    /// Every failure, in task order. Walking the tasks themselves is more
    /// reliable than reading the aggregate, which makes no ordering promise
    /// and may hold nested aggregates.
    /// </summary>
    public static async Task<IReadOnlyList<string>> AllFailuresOf(params Func<Task>[] work)
    {
        ArgumentNullException.ThrowIfNull(work);

        Task[] tasks = work.Select(w => w()).ToArray();

        try
        {
            await Task.WhenAll(tasks);
        }
        catch
        {
            // Swallowed deliberately: the failures are collected below, from
            // the tasks, so nothing is lost.
        }

        List<string> failures = new();
        foreach (Task task in tasks)
        {
            if (task.Exception is { } aggregate)
            {
                foreach (Exception inner in aggregate.Flatten().InnerExceptions)
                {
                    failures.Add(inner.GetType().Name);
                }
            }
        }

        return failures;
    }
}
