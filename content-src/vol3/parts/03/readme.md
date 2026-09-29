# V3·C3 — IDisposable, IAsyncDisposable and deterministic cleanup

## The problem statement

Tracing garbage collection buys you safety and costs you timing. The collector
will reclaim your object's memory eventually; it has no idea that the object
was also holding a file lock, a socket, a pooled connection, an OS mutex, a
timer registration or an event subscription. `IDisposable` is the convention
that puts the timing back under your control, and `using` is the syntax that
makes forgetting it hard.

The question "should this type be `IDisposable`?" has one useful test: does
anything outside this object — another process, another request, another
thread, the OS — notice if release is late? If yes, implement it. If the only
thing you hold is memory, do not.

## The three shapes of a disposable type

**Shape one: owns other disposables.** By far the most common, and the
simplest. No finalizer. Seal it if you can.

```csharp
public sealed class Importer : IDisposable
{
    private readonly StreamReader reader;
    private bool disposed;

    public Importer(string path) => reader = new StreamReader(path);

    public void Dispose()
    {
        if (disposed) return;
        disposed = true;
        reader.Dispose();
    }
}
```

**Shape two: owns an unmanaged resource, through a `SafeHandle`.** Still no
finalizer of your own — the handle has one.

```csharp
public sealed class Device : IDisposable
{
    private readonly SafeFileHandle handle;
    public void Dispose() => handle.Dispose();
}
```

**Shape three: the full pattern.** Only when you hold a raw unmanaged resource
directly *and* the type can be inherited from.

```csharp
public class Connection : IDisposable
{
    private IntPtr native;
    private bool disposed;

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    ~Connection() => Dispose(disposing: false);

    protected virtual void Dispose(bool disposing)
    {
        if (disposed) return;
        if (disposing) { /* managed cleanup: other objects are still alive */ }
        if (native != IntPtr.Zero) { Release(native); native = IntPtr.Zero; }
        disposed = true;
    }
}
```

A derived class overrides `Dispose(bool)` — never `Dispose()` — and calls
`base.Dispose(disposing)` at the end.

## Ownership, and the `leaveOpen` flag

```csharp
// Wrong when the caller still needs the stream.
using var writer = new StreamWriter(stream);

// Right: say who owns it.
using var writer = new StreamWriter(stream, Encoding.UTF8, 1024, leaveOpen: true);
```

The rule: **dispose what you created, not what you were handed** — unless the
caller explicitly transferred ownership. When your type wraps something the
caller may still want, take a `leaveOpen` parameter and make them choose. The
BCL does this everywhere for exactly this reason.

## The async half

```csharp
public sealed class BufferedSink : IAsyncDisposable
{
    public async ValueTask DisposeAsync()
    {
        if (disposed) return;
        disposed = true;
        await FlushAsync().ConfigureAwait(false);
        await inner.DisposeAsync().ConfigureAwait(false);
    }
}

await using var sink = new BufferedSink(stream);
```

`DisposeAsync` returns `ValueTask` because the common case completes
synchronously and allocating a `Task` for it would be waste. Two rules that
follow: never `await` the same `ValueTask` twice, and if you implement both
interfaces, do not implement one by blocking on the other.

```csharp
// The deadlock generator. Do not do this.
public void Dispose() => DisposeAsync().AsTask().GetAwaiter().GetResult();
```

If a type genuinely needs async release, make it `IAsyncDisposable` only; the
compiler will then stop callers from writing a plain `using`.

## Common mistakes

- **A finalizer on a type that owns only managed objects.** Costs every
  instance an extra generation and achieves nothing.
- **Forgetting `GC.SuppressFinalize`** in a finalizable type's `Dispose`. The
  cleanup happens twice — or at least the object waits on the finalizer queue
  for no reason.
- **Overriding `Dispose()` in a derived class** instead of `Dispose(bool)`,
  and thereby bypassing the base's cleanup.
- **Non-idempotent `Dispose`.** Throwing on the second call breaks every
  container that disposes its children.
- **Cleanup in a `catch`.** It runs only when there was an exception; the happy
  path leaks. Cleanup belongs in `finally`, which is to say in a `using`.
- **Disposing what you were handed.** Closing a caller's stream is the classic
  library bug.
- **`using` on an `IEnumerable` you did not create**, or on a dependency-injected
  singleton. Disposing something the container owns takes it away from everyone
  else.
- **Sync-over-async in `Dispose`.** Blocks a thread pool thread at best,
  deadlocks at worst.
- **Assuming the finalizer will save you.** It runs at an unknown time, on
  another thread, possibly never — the runtime does not guarantee finalizers run
  at process exit.

## A decision table you can apply in a review

| What the type holds | Implement | Finalizer? | Notes |
| --- | --- | --- | --- |
| Only memory | nothing | no | The collector already handles it |
| Other `IDisposable` fields it created | `IDisposable` | no | Seal it; dispose in reverse creation order |
| An `IDisposable` it was handed | nothing, or `leaveOpen` | no | Do not dispose what you borrowed |
| A `SafeHandle` | `IDisposable` | no | The handle's own finalizer is the safety net |
| A raw `IntPtr`, sealed type | `IDisposable` | yes | Private cleanup method is enough |
| A raw `IntPtr`, inheritable | full pattern | yes | `protected virtual Dispose(bool)` |
| A buffer that must be flushed | `IAsyncDisposable` | no | Flushing is I/O; do not fake it synchronously |
| An event subscription | `IDisposable` token | no | Return it from `Subscribe` |
| A pooled object | `IDisposable` | no | `Dispose` returns it; guard the double return |

The second column is the interesting one: in eight of nine rows the answer is
"no finalizer", and in two of them the answer is "do not implement disposal at
all". Most disposal bugs in real codebases are people implementing more of the
pattern than they need, then getting one piece of it wrong.

## Ordering, and why reverse

Nested `using` blocks are nested `try`/`finally` blocks, so the inner resource
is released first. That is not an arbitrary consequence — it is usually the only
correct order:

```csharp
using var connection = OpenConnection();
using var command = connection.CreateCommand();   // depends on the connection
using var reader = command.ExecuteReader();       // depends on the command
```

Reader, then command, then connection. Dispose the connection first and the
command's cleanup runs against a closed connection, which in the best case
throws and in the worst case silently skips a rollback. Any container that
disposes a set of resources — a DI scope, a `CompositeDisposable`, a middleware
pipeline — has to preserve this, which is why "reverse registration order" shows
up as a requirement in this sector's challenge.

## Interview answer

*"Explain `IDisposable`."* — It is the convention for releasing resources whose
release cannot wait for garbage collection: handles, connections, locks,
subscriptions. `using` compiles to `try`/`finally` so `Dispose` runs on every
exit path including exceptions. The contract requires idempotence. The full
pattern with `Dispose(bool)`, a finalizer and `SuppressFinalize` is only for
types that directly own unmanaged resources and can be inherited; if you own
only managed disposables, implement `Dispose()`, seal the type, and write no
finalizer, because a finalizer forces every instance to survive an extra
generation.

*Follow-up worth pre-empting:* `IAsyncDisposable` exists because release can be
I/O — flushing a buffer — and doing that synchronously means blocking or
deadlocking. `await using` selects it. A type implementing both must implement
each properly rather than one in terms of the other.

## Check yourself

1. What does a `using` statement compile to, exactly?
2. Why must `Dispose` be idempotent? Name a caller that relies on it.
3. What does the `disposing` parameter mean, and what may you not do when it
   is false?
4. When is the full dispose pattern actually required?
5. Why does `StreamWriter` have a `leaveOpen` parameter?
6. Two nested `using` statements: which disposes first, and why does the order
   matter?
7. The body throws and `Dispose` also throws. Which exception does the caller
   see, and how do you keep the other one?
8. Why is `Dispose() => DisposeAsync().GetAwaiter().GetResult()` dangerous?
9. Why does `DisposeAsync` return `ValueTask` rather than `Task`?
10. How does an event subscription leak memory, and how does an `IDisposable`
    token fix it?
11. Why does `bus.Fired -= (s, e) => Handle()` fail to unsubscribe?
12. What is wrong with putting cleanup in a `catch` block?
13. A pooled object's `Dispose` returns it to the pool. What must it detect to
    stay safe?
14. Does the runtime guarantee finalizers run before the process exits?
