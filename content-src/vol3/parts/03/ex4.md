@@PROMPT@@
## Exercise 4 - flushing is asynchronous work

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex4.cs`.

`BufferedSink` batches lines and writes them out only when the batch is full or
when it is disposed. Because writing is I/O, release is asynchronous.

- `BufferedSink(Func<IReadOnlyList<string>, CancellationToken, ValueTask> write,
  int batchSize)` — `batchSize` below 1 throws
  `ArgumentOutOfRangeException`.
- `ValueTask AddAsync(string line, CancellationToken ct = default)` — buffers
  the line and flushes when the buffer reaches `batchSize`.
- `ValueTask DisposeAsync()` — flushes whatever remains, then marks itself
  disposed. Calling it twice must not flush twice.
- `int Flushes` — how many times the write delegate has been invoked.
- `AddAsync` after disposal throws `ObjectDisposedException`.

```
var batches = new List<string[]>();
await using (var sink = new BufferedSink((lines, ct) =>
{
    batches.Add(lines.ToArray());
    return ValueTask.CompletedTask;
}, batchSize: 2))
{
    await sink.AddAsync("a");
    await sink.AddAsync("b");     // full: flushes ["a", "b"]
    await sink.AddAsync("c");
}                                  // DisposeAsync flushes ["c"]

batches   -> [["a","b"], ["c"]]
sink.Flushes -> 2

// an empty buffer at disposal flushes nothing at all
```

The gate also calls `DisposeAsync()` twice and asserts `Flushes` does not
change on the second call.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex4
```
@@HINTS@@
## Hint 1

`DisposeAsync` exists here for one reason: the release genuinely does I/O.
Everything else follows from that — the `ValueTask` return, the `await using`
at the call site, and the fact that a synchronous `Dispose` could not do this
job without blocking.

## Hint 2

The disposal, in the shape you want:

```csharp
public async ValueTask DisposeAsync()
{
    if (disposed) return;
    disposed = true;              // before the await, not after
    await FlushAsync().ConfigureAwait(false);
}
```

Setting the flag before the `await` is what makes a second call a no-op even if
it arrives while the first flush is still in flight.

## Hint 3

An empty buffer should flush nothing — calling the write delegate with an empty
list is a wasted round trip and, for a real sink, sometimes an error. Guard for
it in one place: put the emptiness check inside the flush rather than at every
call site. Then decide whether `AddAsync` should flush *before* or *after*
adding the line that fills the batch; only one of those produces batches of
exactly `batchSize`.
@@IMPORTANT@@
## Hint 1

Think about what happens if the process exits without disposing. The buffered
lines are gone — no flush, no error, no trace. That is the reason a buffering
type must be disposable and the reason `await using` matters more here than for
a type whose disposal only releases a handle.

## Hint 2

`ValueTask` is not `Task` and has stricter rules:

```csharp
ValueTask flush = sink.DisposeAsync();
await flush;
await flush;     // wrong: a ValueTask may be awaited only once
```

It exists so the synchronous-completion case allocates nothing. If you need to
await something twice, or hand it to `Task.WhenAll`, call `.AsTask()` first and
accept the allocation.

## Hint 3

The buffer must be cleared as part of the flush, not after the caller returns,
and the clear must happen even if the write delegate throws — otherwise a
failed flush leaves the lines buffered and the next flush sends them twice.
Decide whether "exactly once" or "at least once" is the promise you are making,
say so in a comment, and make the code match it.
@@REF@@
// v3cc03_deterministic_cleanup / ex4 - flushing is asynchronous work.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Exercise 4".

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>
/// Batches lines and writes them when the batch fills or at disposal. Release
/// performs I/O, which is exactly what IAsyncDisposable is for.
/// </summary>
public sealed class BufferedSink : IAsyncDisposable
{
    private readonly Func<IReadOnlyList<string>, CancellationToken, ValueTask> write;
    private readonly int batchSize;
    private readonly List<string> buffer = new();
    private bool disposed;

    public BufferedSink(Func<IReadOnlyList<string>, CancellationToken, ValueTask> write, int batchSize)
    {
        ArgumentNullException.ThrowIfNull(write);
        ArgumentOutOfRangeException.ThrowIfLessThan(batchSize, 1);

        this.write = write;
        this.batchSize = batchSize;
    }

    public int Flushes { get; private set; }

    public async ValueTask AddAsync(string line, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(line);
        ObjectDisposedException.ThrowIf(disposed, this);

        buffer.Add(line);
        if (buffer.Count >= batchSize)
        {
            await FlushAsync(ct).ConfigureAwait(false);
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (disposed)
        {
            return;
        }

        // Before the await: a second call arriving while this flush is still
        // in flight must not start a second one.
        disposed = true;
        await FlushAsync(CancellationToken.None).ConfigureAwait(false);
    }

    /// <summary>
    /// Exactly-once delivery of what is buffered: the lines leave the buffer
    /// before the write, so a failed write loses them rather than sending
    /// them twice. Say which promise you are making - this one is "at most
    /// once", and a retrying sink would choose the other.
    /// </summary>
    private async ValueTask FlushAsync(CancellationToken ct)
    {
        if (buffer.Count == 0)
        {
            return;   // never call the sink with an empty batch
        }

        string[] batch = buffer.ToArray();
        buffer.Clear();

        Flushes++;
        await write(batch, ct).ConfigureAwait(false);
    }
}
