# V3·C3 — IDisposable, IAsyncDisposable and deterministic cleanup

The previous sector ended on a deliberate cliffhanger: the garbage collector
reclaims memory, eventually, on its own schedule, and that is fine for memory
and useless for everything else. A file handle held for an extra thirty
seconds blocks another process. A database connection not returned to the pool
starves the next request. A socket left open holds a port. None of those are
memory, and the collector has no opinion about any of them.

`IDisposable` is the language's answer: a convention that says "I own
something whose release cannot wait for a collection", and a `using` block
that guarantees the release happens on every path out of a scope, including
the exceptional ones.

## What `using` actually compiles to

```csharp
using (var file = File.OpenRead(path))
{
    Read(file);
}
```

becomes, near enough:

```csharp
FileStream file = File.OpenRead(path);
try
{
    Read(file);
}
finally
{
    if (file is not null) ((IDisposable)file).Dispose();
}
```

That is the entire feature. Knowing it explains everything else: why disposal
happens even when the body throws, why the `using` declaration form disposes at
the end of the *enclosing* scope, why nested `using`s dispose in reverse order
(they are nested `finally` blocks), and why an exception thrown *from* a
`Dispose` inside a `finally` replaces the exception that was already in
flight — losing the one that mattered.

## The pattern, and how little of it you usually need

The full dispose pattern — a public `Dispose()`, a `protected virtual
Dispose(bool)`, a finalizer, and `GC.SuppressFinalize` — exists for exactly one
situation: a type that directly owns an **unmanaged** resource and can be
inherited from. That is rare. The modern guidance, which the BCL follows
itself, is:

- Own unmanaged resources through a `SafeHandle`. It has a correct, robust
  finalizer already, and it is safe against being finalized in the middle of a
  P/Invoke.
- If your type only owns other `IDisposable` objects, implement `Dispose()`,
  dispose them, and write **no finalizer**. As you saw last sector, a finalizer
  makes every instance survive an extra generation for nothing.
- Seal the type if you can. Then `Dispose(bool)` is unnecessary and a plain
  private method will do.

```csharp
public sealed class Importer : IDisposable
{
    private readonly StreamReader reader;
    private bool disposed;

    public void Dispose()
    {
        if (disposed) return;   // idempotent: a second call is a no-op
        disposed = true;
        reader.Dispose();
    }
}
```

## Exercise 1 - the pattern, written out once

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex1.cs`. `Connection` owns a
pretend unmanaged handle and a managed buffer, implements the full pattern —
public `Dispose()`, `protected virtual Dispose(bool disposing)`, a finalizer,
`GC.SuppressFinalize` — and logs which branch ran. A derived
`LoggingConnection` overrides `Dispose(bool)` and must call `base.Dispose`.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex1
```

## Exercise 2 - after disposal, refuse

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex2.cs`. Every public member of
`Cursor` throws `ObjectDisposedException` once disposed — via
`ObjectDisposedException.ThrowIf`, which is one line and gets the type name
right — and `Dispose()` itself is safely callable any number of times.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex2
```

## Exercise 3 - who owns the stream

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex3.cs`. `RecordWriter` wraps a
`Stream` and takes a `leaveOpen` flag. When it owns the stream it disposes it;
when it does not, it must not — because the caller is still using it. The gate
writes two writers over one stream in sequence and checks the second one still
works.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex3
```

## Exercise 4 - flushing is asynchronous work

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex4.cs`. `BufferedSink`
implements `IAsyncDisposable`: `DisposeAsync` flushes whatever is buffered and
then releases. Any buffered data must reach the sink exactly once, even when
`DisposeAsync` is called twice.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex4
```

## Exercise 5 - both interfaces, and which one wins

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex5.cs`. `DualSink` implements
both `IDisposable` and `IAsyncDisposable` over one core. `await using` must
take the async path; a plain `using` must take the sync path and must not
block on an async operation. The log records which route ran.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex5
```

## Exercise 6 - the exception your cleanup hid

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex6.cs`. When the body throws
*and* the disposal throws, the naive `try`/`finally` loses the first exception
entirely. Implement `SafeScope.Run`, which surfaces the body's exception as the
primary one and attaches the disposal failure — and prove the ordering with
nested resources that dispose in reverse.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex6
```

## Exercise 7 - a subscription is a resource

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex7.cs`. `EventBus.Subscribe`
returns an `IDisposable` whose `Dispose` unsubscribes. This is the fix for the
most common managed memory leak in .NET: a long-lived publisher holding
delegates that reference short-lived subscribers, keeping them alive forever.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex7
```

## Exercise 8 - Dispose that gives the object back

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex8.cs`. `PooledBuffer.Dispose`
resets the object and returns it to its pool instead of destroying it — the
`ArrayPool` idea from sector C1, wrapped in a `using`. A double return must be
detected and rejected, because a buffer handed to two owners is silent
corruption.

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex8
```

## Challenge

`CompositeDisposable` collects resources and disposes them in reverse
registration order, is idempotent, keeps going when one child throws, and
reports every failure in a single `AggregateException`. It also accepts
`IAsyncDisposable` children. Small surface, and every rule in this sector shows
up in it.

## Review

`review1` gives you `LegacyExporter`, a class with four disposal bugs — no
suppression, non-idempotent, cleanup in a `catch`, and disposing a stream it
never owned. You reimplement it correctly and add an async path. Reading
broken cleanup and naming what is wrong is the version of this skill you will
actually use.
