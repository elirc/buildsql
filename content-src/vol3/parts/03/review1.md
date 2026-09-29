@@PROMPT@@
## Review 1 - four bugs, then the rewrite

Edit `src/Lessons/V3CC03_DeterministicCleanup/Review1.cs`. The sector from the
other side: reading broken cleanup, naming what is wrong, and fixing it.

`LegacyExporter` is supplied, verbatim from a real codebase, with four
disposal bugs:

1. It has a finalizer but owns only managed objects.
2. `Dispose()` never calls `GC.SuppressFinalize`.
3. Cleanup lives in a `catch`, so the happy path leaks.
4. It disposes a `Stream` that was handed to it by the caller.

First, name them. `DisposalAudit.Findings(string source)` is not the exercise —
instead implement `DisposalAudit.Diagnose(LegacyExporter exporter)` returning
the four codes in this order:
`["UnnecessaryFinalizer", "MissingSuppressFinalize", "CleanupInCatch",
"DisposesBorrowedStream"]`.

Then write `Exporter`, the correct version:

- `Exporter(Stream destination, bool leaveOpen)` — same job, correct
  ownership.
- `void Export(IEnumerable<string> rows)` — writes each row plus `'\n'`;
  after disposal throws `ObjectDisposedException`.
- `Dispose()` — idempotent, no finalizer, disposes the destination only when it
  owns it, and cleanup that runs on **every** path.
- `ValueTask DisposeAsync()` — flushes and disposes asynchronously, sharing the
  same disposed flag, and never blocking on the sync path or vice versa.
- `Exporter.WhyNoFinalizer` — the one-sentence explanation, returned as a
  string, because being able to say it is the skill.

```
Diagnose(new LegacyExporter(stream))
  -> ["UnnecessaryFinalizer", "MissingSuppressFinalize",
      "CleanupInCatch", "DisposesBorrowedStream"]

var stream = new TrackedStream();
await using (var e = new Exporter(stream, leaveOpen: true))
    e.Export(["a", "b"]);
stream.IsClosed   -> false
Encoding.UTF8.GetString(stream.ToArray())  -> "a\nb\n"

using (var e2 = new Exporter(new MemoryStream(), leaveOpen: false)) { }
// owns it, so it closes it
```

```
uv run dojo test csharp v3cc03_deterministic_cleanup review1
```
@@HINTS@@
## Hint 1

Diagnose before you rewrite. Each of the four bugs has a distinct symptom: an
instance that survives an extra generation for nothing; an object that waits on
the finalizer queue after being disposed properly; a resource released only
when something went wrong; and a caller whose stream is closed underneath them.
Match symptom to code, then write the fix.

## Hint 2

The corrected shape is much shorter than the broken one:

```csharp
public sealed class Exporter : IDisposable, IAsyncDisposable
{
    private bool disposed;

    public void Dispose()
    {
        if (disposed) return;
        disposed = true;
        if (!leaveOpen) destination.Dispose();
    }
}
```

No `Dispose(bool)`, no finalizer, no `SuppressFinalize` — because a sealed type
owning only managed resources needs none of them. Deleting code is the fix.

## Hint 3

The two disposal routes share one flag, and each must be complete on its own:
`DisposeAsync` uses `FlushAsync` and `destination.DisposeAsync()`, `Dispose`
uses the synchronous pair. Neither calls the other. Decide what `Export` does
about buffering — if it writes straight through, `DisposeAsync` has nothing to
flush and you should say so rather than pretending there is async work.
@@IMPORTANT@@
## Hint 1

For each finding, ask "who notices?". The unnecessary finalizer is noticed by
the GC, as promotion. The missing `SuppressFinalize` is noticed by the
finalizer thread. The cleanup in a `catch` is noticed by whoever runs out of
handles first. The borrowed stream is noticed by the caller, immediately, as an
`ObjectDisposedException` they cannot explain. Four bugs, four different
victims — which is why they all need different names.

## Hint 2

The `catch` versus `finally` distinction, made concrete:

```csharp
try { Write(rows); }
catch { writer.Dispose(); throw; }   // only on failure
finally { writer.Dispose(); }        // on every path - this is what using does
```

The first version leaks on every successful export, which is the majority of
them, which is why the leak takes months to notice.

## Hint 3

`WhyNoFinalizer` should be one sentence a reviewer could paste into a pull
request: a finalizer is only for unmanaged resources this type owns directly,
and it costs every instance an extra generation of survival. Write it, then
check your own `Exporter` against it — if you find yourself wanting a finalizer
after all, one of the two is wrong.
@@REF@@
// v3cc03_deterministic_cleanup / review1 - four bugs, then the rewrite.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Review 1".

using System.Text;

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>
/// Supplied, verbatim from a real codebase. Four disposal bugs, each with a
/// different victim.
/// </summary>
public sealed class LegacyExporter : IDisposable
{
    private readonly Stream destination;      // bug 4: handed to us, not ours
    private readonly List<string> pending = new();

    public LegacyExporter(Stream destination) => this.destination = destination;

    // bug 1: a finalizer on a type that owns only managed objects.
    ~LegacyExporter() => Dispose();

    public void Export(IEnumerable<string> rows)
    {
        try
        {
            foreach (string row in rows)
            {
                pending.Add(row);
            }
        }
        catch
        {
            // bug 3: cleanup in a catch - the happy path never releases.
            destination.Dispose();
            throw;
        }
    }

    public void Dispose()
    {
        pending.Clear();
        destination.Dispose();
        // bug 2: no GC.SuppressFinalize, so a disposed instance still waits
        // on the finalization queue.
    }
}

public static class DisposalAudit
{
    /// <summary>The four findings, in the order they appear in the source.</summary>
    public static IReadOnlyList<string> Diagnose(LegacyExporter exporter)
    {
        ArgumentNullException.ThrowIfNull(exporter);

        return
        [
            "UnnecessaryFinalizer",
            "MissingSuppressFinalize",
            "CleanupInCatch",
            "DisposesBorrowedStream",
        ];
    }
}

/// <summary>
/// The rewrite. Sealed, owning only managed resources, so the whole
/// Dispose(bool)/finalizer/SuppressFinalize apparatus is unnecessary - the fix
/// is mostly deletion.
/// </summary>
public sealed class Exporter : IDisposable, IAsyncDisposable
{
    private readonly Stream destination;
    private readonly bool leaveOpen;
    private bool disposed;

    public Exporter(Stream destination, bool leaveOpen)
    {
        this.destination = destination ?? throw new ArgumentNullException(nameof(destination));
        this.leaveOpen = leaveOpen;
    }

    public static string WhyNoFinalizer =>
        "a finalizer is only for unmanaged resources a type owns directly, and it " +
        "costs every instance an extra generation of survival";

    public void Export(IEnumerable<string> rows)
    {
        ArgumentNullException.ThrowIfNull(rows);
        ObjectDisposedException.ThrowIf(disposed, this);

        foreach (string row in rows)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(row + "\n");
            destination.Write(bytes, 0, bytes.Length);
        }
    }

    public void Dispose()
    {
        if (disposed)
        {
            return;
        }

        disposed = true;

        // Write-through, so there is nothing buffered to flush - and saying so
        // is better than a Flush that pretends to do work.
        if (!leaveOpen)
        {
            destination.Dispose();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (disposed)
        {
            return;
        }

        disposed = true;

        await destination.FlushAsync().ConfigureAwait(false);

        if (!leaveOpen)
        {
            await destination.DisposeAsync().ConfigureAwait(false);
        }
    }
}
