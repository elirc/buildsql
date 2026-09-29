@@PROMPT@@
## Exercise 1 - the pattern, written out once

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex1.cs`.

`Connection` owns a pretend unmanaged handle (an `int` that is non-zero while
open) and a managed `List<string>` buffer, and implements the full dispose
pattern. Every step appends to a supplied `List<string>` log:

- `Dispose()` calls `Dispose(true)` then `GC.SuppressFinalize(this)`.
- `protected virtual void Dispose(bool disposing)` — returns immediately if
  already disposed; when `disposing` is true it clears the managed buffer and
  logs `"managed"`; either way it releases the handle and logs `"unmanaged"`;
  then marks itself disposed.
- `~Connection()` calls `Dispose(false)`.
- `IsOpen` is true until the handle is released.

`LoggingConnection : Connection` overrides `Dispose(bool)`, logs
`"derived:{disposing}"` **before** delegating, and calls
`base.Dispose(disposing)`.

```
var log = new List<string>();
using (var c = new LoggingConnection(log)) { }
log  ->  ["derived:True", "managed", "unmanaged"]

var c2 = new Connection(log2);
c2.Dispose();
c2.Dispose();               // second call adds nothing
log2 -> ["managed", "unmanaged"]
c2.IsOpen -> false
```

The gate also checks that a disposed `Connection` produces no finalizer entry
after `GC.Collect()` and `GC.WaitForPendingFinalizers()`, which is
`SuppressFinalize` doing its job.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex1
```
@@HINTS@@
## Hint 1

Two entry points, one implementation. `Dispose()` is what callers use;
`Dispose(bool)` is where the work lives; the finalizer is the safety net. The
`bool` answers one question — "is the rest of the managed world still alive?" —
and everything conditional in the method hangs off that.

## Hint 2

The derived class extends rather than replaces:

```csharp
protected override void Dispose(bool disposing)
{
    log.Add($"derived:{disposing}");
    base.Dispose(disposing);        // never optional
}
```

Overriding `Dispose()` instead of `Dispose(bool)` compiles — the public one is
not virtual, so you would be *hiding* it — and silently skips the base class's
cleanup on every path that goes through the base type.

## Hint 3

The disposed flag has to be checked first and set last, so a re-entrant or
repeated call does nothing. Decide where `SuppressFinalize` belongs: it must be
in `Dispose()` and not in `Dispose(bool)`, because the finalizer path calls
`Dispose(false)` and suppressing finalization from inside the finalizer is
meaningless. Being able to say why is the exercise.
@@IMPORTANT@@
## Hint 1

Start by asking whether this type should have a finalizer at all. It should,
here, because it directly owns something the collector cannot reclaim — and the
moment you replace that `int` with a `SafeHandle`, the finalizer, the
`SuppressFinalize` and half the pattern become unnecessary. That contrast is
the real lesson.

## Hint 2

`disposing: false` is a hostile environment. You are on the finalizer thread,
the objects you reference may already have been finalized, and you have no idea
what else is running. So:

```csharp
if (disposing)
{
    buffer.Clear();     // safe: the caller's thread, everything alive
}
ReleaseHandle();        // always: this is the only thing that must happen
```

Touching an *owned* managed object in the `false` branch is how a finalizer
throws on a background thread and takes the process down. The log here is the
documented exception: it belongs to the caller, outlives this object, and is
reachable from the gate, so writing to it from either path is safe — and being
able to tell those two cases apart is the point.

## Hint 3

For the log to be readable, decide the order deliberately: derived before base,
managed before unmanaged. Then check the ordering claim against the object
graph — the derived class's resources are conceptually "outside" the base's, so
they should be released first, exactly like nested `using` blocks disposing in
reverse.
@@REF@@
// v3cc03_deterministic_cleanup / ex1 - the pattern, written out once.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Exercise 1".

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>
/// The full dispose pattern - which is only warranted because this type
/// directly owns an unmanaged handle AND can be inherited from. Replace the
/// handle with a SafeHandle and most of this disappears.
/// </summary>
public class Connection : IDisposable
{
    private readonly List<string> log;
    private readonly List<string> buffer = new();
    private int handle = 1;          // non-zero means open
    private bool disposed;

    public Connection(List<string> log)
    {
        this.log = log ?? throw new ArgumentNullException(nameof(log));
    }

    ~Connection() => Dispose(disposing: false);

    public bool IsOpen => handle != 0;

    protected List<string> Log => log;

    public void Dispose()
    {
        Dispose(disposing: true);

        // Only here: the finalizer path is already running, so suppressing
        // finalization from inside Dispose(false) would mean nothing.
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (disposed)
        {
            return;
        }

        if (disposing)
        {
            // Safe: the caller's thread, and every managed object is alive.
            buffer.Clear();
            log.Add("managed");
        }

        // Always: this is the part the collector cannot do for us. The log
        // is the caller's, not ours, so it is still safe to touch here - an
        // owned managed field would not be.
        handle = 0;
        log.Add("unmanaged");
        disposed = true;
    }
}

public sealed class LoggingConnection : Connection
{
    public LoggingConnection(List<string> log)
        : base(log)
    {
    }

    protected override void Dispose(bool disposing)
    {
        Log.Add($"derived:{disposing}");

        // Never optional: skipping this leaks everything the base owns.
        base.Dispose(disposing);
    }
}
