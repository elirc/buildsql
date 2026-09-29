@@PROMPT@@
## Exercise 6 - the exception your cleanup hid

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex6.cs`.

A plain `try`/`finally` loses the body's exception when the disposal also
throws. Build the version that does not.

`Probe(string name, List<string> log, bool throwOnDispose)` is the resource: it
logs `"open:{name}"` on construction and `"close:{name}"` on disposal, and
throws `InvalidOperationException($"dispose failed: {name}")` when told to.
Disposal is idempotent and the log entry appears exactly once.

`SafeScope.Run(Action body, params IDisposable[] resources)`:

- Runs `body`, then disposes every resource in **reverse** order — the last one
  registered is the first one closed.
- A resource that throws during disposal does not prevent the remaining ones
  from being disposed.
- If only the body threw, that exception propagates unchanged (same instance,
  original stack).
- If only disposals threw, an `AggregateException` carries them in disposal
  order.
- If both threw, an `AggregateException` carries the body's exception **first**,
  then the disposal failures.

```
var log = new List<string>();
var a = new Probe("a", log, throwOnDispose: false);
var b = new Probe("b", log, throwOnDispose: true);

SafeScope.Run(() => throw new FormatException("bad row"), a, b);
// log: open:a, open:b, close:b, close:a
// throws AggregateException with InnerExceptions:
//   [0] FormatException "bad row"
//   [1] InvalidOperationException "dispose failed: b"

SafeScope.Run(() => { }, a2, b2)   // b2 throws on dispose
// throws AggregateException with one inner: the dispose failure
```

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex6
```
@@HINTS@@
## Hint 1

The bug you are fixing is structural. In `try { body(); } finally {
resource.Dispose(); }` a throw from the `finally` replaces whatever was already
in flight, and C# has no suppressed-exception list to keep the original. So the
fix is to stop letting the `finally` throw at all: catch there, and decide
what to surface yourself.

## Hint 2

Capture rather than rethrow immediately:

```csharp
Exception? bodyFailure = null;
try { body(); }
catch (Exception ex) { bodyFailure = ex; }
```

Yes, this catches everything, which is normally a smell — here it is the point,
because you are going to re-surface it rather than swallow it, and you need the
disposal to run before you decide how.

## Hint 3

Reverse order is a `for` loop counting down, and each disposal gets its own
`try`/`catch` so one failure cannot stop the next. At the end you have a body
failure (or not) and a list of disposal failures (possibly empty), which gives
four cases — and only one of them, "body threw and nothing else did", is allowed
to rethrow the original instance rather than wrap it. Decide how you rethrow
without resetting the stack trace; `throw;` is not available outside a catch
block, so something else is needed.
@@IMPORTANT@@
## Hint 1

The reason this matters is diagnostic, not aesthetic. When cleanup swallows the
real failure, every stack trace in your logs points at the cleanup code, and
the outage takes hours longer to understand. Preserving the primary exception
is what makes the log entry worth having.

## Hint 2

To rethrow a captured exception with its original stack intact:

```csharp
ExceptionDispatchInfo.Capture(bodyFailure).Throw();
```

`throw bodyFailure;` resets the stack trace to this line, discarding the frames
that explain where it came from. This is the same machinery `await` uses when
it resurfaces a faulted task's exception on your thread.

## Hint 3

Reverse order is not decoration; it is correctness. A resource opened later may
depend on an earlier one still being alive — a command on a connection, a
writer on a stream — which is exactly why nested `using` blocks unwind in this
direction. Verify the order in the log before you worry about the exception
shape, because a correct exception over the wrong disposal order is still
wrong.
@@REF@@
// v3cc03_deterministic_cleanup / ex6 - the exception your cleanup hid.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Exercise 6".

using System.Runtime.ExceptionServices;

namespace CSharpDojo.V3CC03_DeterministicCleanup;

public sealed class Probe : IDisposable
{
    private readonly List<string> log;
    private readonly bool throwOnDispose;
    private bool disposed;

    public Probe(string name, List<string> log, bool throwOnDispose)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        this.log = log ?? throw new ArgumentNullException(nameof(log));
        this.throwOnDispose = throwOnDispose;
        log.Add($"open:{name}");
    }

    public string Name { get; }

    public void Dispose()
    {
        if (disposed)
        {
            return;
        }

        disposed = true;
        log.Add($"close:{Name}");

        if (throwOnDispose)
        {
            throw new InvalidOperationException($"dispose failed: {Name}");
        }
    }
}

/// <summary>
/// try/finally loses the body's exception when the cleanup throws. This does
/// not: the body's failure stays primary, and every disposal still runs.
/// </summary>
public static class SafeScope
{
    public static void Run(Action body, params IDisposable[] resources)
    {
        ArgumentNullException.ThrowIfNull(body);
        ArgumentNullException.ThrowIfNull(resources);

        Exception? bodyFailure = null;
        try
        {
            body();
        }
        catch (Exception ex)
        {
            // Caught, not swallowed: it is re-surfaced below, after cleanup.
            bodyFailure = ex;
        }

        List<Exception> disposalFailures = new();

        // Reverse order: the last resource opened may depend on an earlier
        // one still being alive, exactly like nested using blocks.
        for (int i = resources.Length - 1; i >= 0; i--)
        {
            try
            {
                resources[i]?.Dispose();
            }
            catch (Exception ex)
            {
                disposalFailures.Add(ex);
            }
        }

        if (bodyFailure is null && disposalFailures.Count == 0)
        {
            return;
        }

        if (bodyFailure is not null && disposalFailures.Count == 0)
        {
            // Same instance, original stack: throw bodyFailure; would reset it.
            ExceptionDispatchInfo.Capture(bodyFailure).Throw();
        }

        List<Exception> all = new();
        if (bodyFailure is not null)
        {
            all.Add(bodyFailure);   // the primary failure comes first
        }

        all.AddRange(disposalFailures);
        throw new AggregateException("the scope failed", all);
    }
}
