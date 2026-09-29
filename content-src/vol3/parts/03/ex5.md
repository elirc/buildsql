@@PROMPT@@
## Exercise 5 - both interfaces, and which one wins

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex5.cs`.

`DualSink` implements `IDisposable` **and** `IAsyncDisposable` over one core,
and records which route ran in a supplied `List<string>`.

- `DisposeAsync()` — logs `"async:flush"` then `"async:release"`, awaiting a
  supplied flush delegate.
- `Dispose()` — logs `"sync:release"` only. It does **not** flush, does not
  block on the async path, and does not call `DisposeAsync`.
- Both are idempotent, and whichever runs first wins: calling `Dispose()` after
  `DisposeAsync()` adds nothing.
- `DualSink.PendingBytes` is non-zero until a flush happens, so the gate can
  see that the synchronous route left data unflushed — deliberately, and
  documented.

Then `Routes.Describe(bool awaitUsing)` returns which member `await using`
versus `using` binds to: `"DisposeAsync"` or `"Dispose"`.

```
var log = new List<string>();
await using (var s = new DualSink(log, flush)) { }
log  ->  ["async:flush", "async:release"]

var log2 = new List<string>();
using (var s2 = new DualSink(log2, flush)) { }
log2 ->  ["sync:release"]
s2.PendingBytes > 0        // the synchronous route cannot flush

Routes.Describe(awaitUsing: true)   -> "DisposeAsync"
Routes.Describe(awaitUsing: false)  -> "Dispose"
```

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex5
```
@@HINTS@@
## Hint 1

The syntax at the call site chooses the member, not the type. `await using`
binds to `DisposeAsync`; plain `using` binds to `Dispose`. The compiler emits
no warning about which one you got, so a type implementing both must make each
one honestly correct on its own terms.

## Hint 2

What you must not write, however tempting:

```csharp
public void Dispose() => DisposeAsync().AsTask().GetAwaiter().GetResult();
```

This blocks a thread on I/O, and under a synchronisation context it deadlocks:
the continuation needs the thread that is blocked waiting for it. If the async
work is genuinely mandatory, the honest design is to implement
`IAsyncDisposable` only and let the compiler reject `using`.

## Hint 3

Share one `disposed` flag between both routes so whichever runs first wins.
Then decide what the synchronous path should do about the unflushed data: this
exercise says "release without flushing, and be explicit about it", which is
defensible because the alternative is worse. Write that decision as a comment —
a reader who finds an unflushed buffer needs to know it was a choice.
@@IMPORTANT@@
## Hint 1

Ask which of the two routes a caller of your library will actually take. If
you cannot make the synchronous one correct, the answer is not to fake it — it
is to remove it, and let `using` become a compile error. That is a design
decision this exercise makes visible rather than a limitation to work around.

## Hint 2

`ConfigureAwait(false)` belongs on every await in a library's disposal path:

```csharp
await flush().ConfigureAwait(false);
```

Disposal often happens on paths you do not control — an exception unwinding, a
host shutting down — and capturing a context you do not need is how a shutdown
hangs. Application code (ASP.NET Core has no synchronisation context) can skip
it; library code should not.

## Hint 3

The gate reads `PendingBytes` after each route, so the flag and the buffer must
tell a consistent story. Make sure `Dispose()` after `DisposeAsync()` adds
nothing to the log and does not resurrect any state — the second call is a
no-op, not a downgrade to the sync path.
@@REF@@
// v3cc03_deterministic_cleanup / ex5 - both interfaces, and which one wins.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Exercise 5".

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>
/// Implements both disposal interfaces over one core. The call site chooses:
/// `await using` binds to DisposeAsync, `using` binds to Dispose.
/// </summary>
public sealed class DualSink : IDisposable, IAsyncDisposable
{
    private readonly List<string> log;
    private readonly Func<ValueTask> flush;
    private bool disposed;

    public DualSink(List<string> log, Func<ValueTask> flush)
    {
        this.log = log ?? throw new ArgumentNullException(nameof(log));
        this.flush = flush ?? throw new ArgumentNullException(nameof(flush));
    }

    public int PendingBytes { get; private set; } = 128;

    public async ValueTask DisposeAsync()
    {
        if (disposed)
        {
            return;
        }

        disposed = true;

        log.Add("async:flush");

        // ConfigureAwait(false) on every library disposal await: this path
        // runs during shutdowns and unwinds, where capturing a context is how
        // a process hangs.
        await flush().ConfigureAwait(false);
        PendingBytes = 0;

        log.Add("async:release");
    }

    /// <summary>
    /// Releases without flushing, on purpose. Blocking on DisposeAsync here
    /// would be sync-over-async: a thread parked on I/O at best, a deadlock
    /// under a synchronisation context at worst. A caller who needs the flush
    /// must use `await using`.
    /// </summary>
    public void Dispose()
    {
        if (disposed)
        {
            return;   // whichever route ran first wins
        }

        disposed = true;
        log.Add("sync:release");
    }
}

public static class Routes
{
    /// <summary>Which member the call site binds to.</summary>
    public static string Describe(bool awaitUsing) => awaitUsing ? "DisposeAsync" : "Dispose";
}
