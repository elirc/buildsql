@@PROMPT@@
## Exercise 7 - the most expensive keyword in a type declaration

Edit `src/Lessons/V3CC01_GcGenerations/Ex7.cs`.

`TrackedHandle` pretends to own an unmanaged handle. It writes what happened
into a shared `ConcurrentQueue<string>` so the gate can watch the sequence.

- The constructor takes the log and a name.
- `Dispose()` records `"dispose:{name}"`, releases the handle, suppresses the
  finalizer, and is safe to call twice (the second call records nothing).
- The finalizer records `"finalize:{name}"` and releases the handle.
- `Release` is the shared cleanup: `Dispose(bool disposing)` in the
  conventional pattern, where `disposing` is true only from `Dispose()`.
- `TrackedHandle.IsClosed` reports whether the handle has been released.

Then `HandleLab.AbandonOne(ConcurrentQueue<string> log)` creates a
`TrackedHandle` named `"abandoned"` inside a non-inlined helper, drops it,
forces `GC.Collect()` and `GC.WaitForPendingFinalizers()`, and returns.

```
using (var h = new TrackedHandle(log, "used")) { }
// log: "dispose:used"          - and no "finalize:used", ever

HandleLab.AbandonOne(log);
// log contains "finalize:abandoned"
```

The gate asserts that a disposed handle never produces a `finalize` entry and
that an abandoned one does.

```
uv run dojo test csharp v3cc01_gc_generations ex7
```
@@HINTS@@
## Hint 1

The finalizer and `Dispose` do the same cleanup from two different worlds. The
`disposing` flag is how one method serves both: when it is true you are on the
caller's thread and every managed object you reference is still alive; when it
is false you are on the finalizer thread and none of them can be trusted.

## Hint 2

The skeleton, with the two entry points meeting in the middle:

```csharp
public void Dispose()
{
    Dispose(disposing: true);
    GC.SuppressFinalize(this);
}

~Thing() => Dispose(disposing: false);

protected virtual void Dispose(bool disposing)
{
    if (closed) return;
    if (disposing) { /* managed cleanup, safe to touch other objects */ }
    /* unmanaged cleanup, always */
    closed = true;
}
```

## Hint 3

The log is the one managed object the finalizer path must touch, which is
exactly the thing the pattern warns you about — so decide deliberately: the
`ConcurrentQueue` is held for the object's whole life and is still reachable
from the gate, so writing to it from the finalizer is safe here. Say why, and
notice that if the log were owned by the handle rather than shared, it would
not be.
@@IMPORTANT@@
## Hint 1

Start from the cost, not the code. A type with a finalizer is put on the
finalization queue when it is allocated, so the collector cannot reclaim it in
the pass that first notices it is unreachable — the finalizer thread has to run
first, which means at least one extra generation of survival for every
instance. `SuppressFinalize` is how a disposed object buys its way out.

## Hint 2

Do not write a finalizer for a type that owns only managed objects. This is
the whole rule, and the modern version is stronger: own unmanaged resources
through a `SafeHandle` and write no finalizer at all, because `SafeHandle`
already has a correct one and is robust against being finalized halfway
through a P/Invoke.

## Hint 3

`AbandonOne` will not do what you expect unless the handle is genuinely
unreachable. Create it inside a helper marked
`[MethodImpl(MethodImplOptions.NoInlining)]` that returns `void`, so no stack
slot in the caller keeps it alive; then collect, wait for finalizers, and
collect again — the first pass queues the finalizer, the wait runs it. Whether
you need that second collect for this exercise is worth thinking through.
@@REF@@
// v3cc01_gc_generations / ex7 - the most expensive keyword in a type declaration.
// See lessons/v3cc01_gc_generations/README.md, "Exercise 7".

using System.Collections.Concurrent;
using System.Runtime.CompilerServices;

namespace CSharpDojo.V3CC01_GcGenerations;

/// <summary>
/// Stands in for a type that owns an unmanaged handle: the one case where a
/// finalizer earns its cost. Everything it does is written to a shared log so
/// the order is observable.
/// </summary>
public sealed class TrackedHandle : IDisposable
{
    private readonly ConcurrentQueue<string> log;
    private readonly string name;
    private bool closed;

    public TrackedHandle(ConcurrentQueue<string> log, string name)
    {
        this.log = log ?? throw new ArgumentNullException(nameof(log));
        this.name = name ?? throw new ArgumentNullException(nameof(name));
    }

    ~TrackedHandle() => Release(disposing: false);

    public bool IsClosed => closed;

    public void Dispose()
    {
        Release(disposing: true);

        // Off the finalization queue: the cleanup is already done, so letting
        // the finalizer thread visit this object would be pure cost.
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// The shared cleanup. disposing is true only on the Dispose path, where
    /// other managed objects are guaranteed to still be alive.
    /// </summary>
    private void Release(bool disposing)
    {
        if (closed)
        {
            return;
        }

        // The log outlives this object and is owned by the caller, so it is
        // safe to touch from the finalizer thread. An owned managed field
        // would not be.
        log.Enqueue(disposing ? $"dispose:{name}" : $"finalize:{name}");
        closed = true;
    }
}

public static class HandleLab
{
    /// <summary>
    /// Creates a handle, abandons it, and forces the finalizer to run so the
    /// log entry is observable in a test.
    /// </summary>
    public static void AbandonOne(ConcurrentQueue<string> log)
    {
        ArgumentNullException.ThrowIfNull(log);

        Create(log);

        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
    }

    // No inlining: an inlined constructor could leave the reference in a live
    // stack slot of the caller, keeping the object reachable.
    [MethodImpl(MethodImplOptions.NoInlining)]
    private static void Create(ConcurrentQueue<string> log) => _ = new TrackedHandle(log, "abandoned");
}
