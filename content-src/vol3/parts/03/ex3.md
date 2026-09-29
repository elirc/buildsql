@@PROMPT@@
## Exercise 3 - who owns the stream

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex3.cs`.

`TrackedStream` is supplied: a `MemoryStream` subclass that records
`DisposeCount` and exposes `IsClosed`.

`RecordWriter` writes newline-terminated records to a `Stream`:

- `RecordWriter(Stream destination, bool leaveOpen)` — `destination` null
  throws `ArgumentNullException`.
- `void Write(string record)` — appends `record` and `'\n'` as UTF-8; throws
  `ObjectDisposedException` after disposal.
- `Dispose()` — disposes `destination` **only** when `leaveOpen` is false.
  Idempotent either way.
- `static RecordWriter Owning(string firstRecord)` — the convenience factory
  that creates its own `MemoryStream` and therefore owns it.

```
var stream = new TrackedStream();
using (var a = new RecordWriter(stream, leaveOpen: true)) a.Write("one");
stream.IsClosed        -> false          // the caller still owns it
using (var b = new RecordWriter(stream, leaveOpen: true)) b.Write("two");
Encoding.UTF8.GetString(stream.ToArray())  -> "one\ntwo\n"

var owned = new TrackedStream();
using (var c = new RecordWriter(owned, leaveOpen: false)) c.Write("x");
owned.IsClosed         -> true
owned.DisposeCount     -> 1              // disposed once, not twice
```

The gate opens two writers over one stream in sequence — the second one only
works if the first honoured `leaveOpen`.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex3
```
@@HINTS@@
## Hint 1

The rule is short: dispose what you created, do not dispose what you were
handed — unless the caller says otherwise. `leaveOpen` is how the caller says
otherwise, and making it a constructor parameter is how you stop the decision
being buried in the implementation.

## Hint 2

The BCL does exactly this, everywhere, and the parameter is always named the
same way:

```csharp
new StreamWriter(stream, Encoding.UTF8, bufferSize: 1024, leaveOpen: true);
new GZipStream(stream, CompressionMode.Compress, leaveOpen: true);
new BinaryReader(stream, Encoding.UTF8, leaveOpen: true);
```

Copy the convention rather than inventing `ownsStream` or `closeInner`; readers
recognise the name.

## Hint 3

`Owning` is the interesting factory: it creates the stream, so it passes
`leaveOpen: false` and the writer takes responsibility. Note what that means
for the caller — they never see the stream, so they could not dispose it even
if they wanted to, which is why ownership had to transfer. Decide how the
caller gets the bytes back out afterwards, and let that decision tell you
whether `Owning` is a good API at all.
@@IMPORTANT@@
## Hint 1

Work out the failure first. Two writers, one stream, `leaveOpen` false on the
first: the second `Write` throws `ObjectDisposedException` from inside a stream
the caller never closed and does not think is closed. That confusion — an
exception about an object you did not dispose — is the everyday cost of getting
ownership wrong.

## Hint 2

Idempotence and ownership interact. `Dispose` runs at most one disposal of the
inner stream:

```csharp
public void Dispose()
{
    if (disposed) return;
    disposed = true;
    if (!leaveOpen) destination.Dispose();
}
```

Setting the flag *before* the inner disposal also protects you if the inner
`Dispose` re-enters somehow, which is rare but free to guard against.

## Hint 3

Consider whether `Write` should flush. There is no buffer here, so it does not
arise — but if you added one, the flush would have to happen in `Dispose`
whether or not you own the stream, because the bytes are yours even when the
stream is not. That is the exact distinction ex4 turns into an exercise.
@@REF@@
// v3cc03_deterministic_cleanup / ex3 - who owns the stream.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Exercise 3".

using System.Text;

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>A stream that reports how many times it was disposed.</summary>
public sealed class TrackedStream : MemoryStream
{
    public int DisposeCount { get; private set; }

    public bool IsClosed { get; private set; }

    protected override void Dispose(bool disposing)
    {
        DisposeCount++;
        IsClosed = true;

        // Capture the bytes before the base closes the stream, so a caller can
        // still inspect what was written.
        Written = ToArray();
        base.Dispose(disposing);
    }

    public byte[] Written { get; private set; } = [];
}

/// <summary>
/// Writes newline-terminated records. Disposes the destination only when it
/// owns it - the caller decides at construction.
/// </summary>
public sealed class RecordWriter : IDisposable
{
    private readonly Stream destination;
    private readonly bool leaveOpen;
    private bool disposed;

    public RecordWriter(Stream destination, bool leaveOpen)
    {
        this.destination = destination ?? throw new ArgumentNullException(nameof(destination));
        this.leaveOpen = leaveOpen;
    }

    /// <summary>Creates its own stream, so it owns it.</summary>
    public static RecordWriter Owning(string firstRecord)
    {
        RecordWriter writer = new(new MemoryStream(), leaveOpen: false);
        writer.Write(firstRecord);
        return writer;
    }

    public void Write(string record)
    {
        ArgumentNullException.ThrowIfNull(record);
        ObjectDisposedException.ThrowIf(disposed, this);

        byte[] bytes = Encoding.UTF8.GetBytes(record + "\n");
        destination.Write(bytes, 0, bytes.Length);
    }

    public void Dispose()
    {
        if (disposed)
        {
            return;
        }

        // Set the flag before the inner disposal: re-entry is rare and the
        // guard is free.
        disposed = true;

        if (!leaveOpen)
        {
            destination.Dispose();
        }
    }
}
