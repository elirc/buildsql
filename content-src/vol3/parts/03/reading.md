# Long reading - determinism, bolted onto a non-deterministic runtime

## Why the language needed a convention at all

C++ ties resource release to scope: an object's destructor runs at a known
point, and RAII falls out of that for free. Tracing collectors give that up.
The .NET designers knew it, and `IDisposable` is the compensation — but notice
what kind of compensation it is. It is not a language feature with teeth. It is
an interface, a convention, and a bit of compiler sugar. Nothing stops you
forgetting it. The compiler will warn you about some cases (CA2000, IDE0063),
and the runtime will not.

The original design accepted that people would forget, which is why finalizers
exist at all: a last-ditch backstop so a forgotten handle is released
*eventually* rather than never. Two decades of experience have made the
guidance much more sceptical of that backstop. Finalizers are
non-deterministic, run on a single dedicated thread that can back up, can be
skipped entirely at process exit, and — as the GC sector showed — impose a real
cost on every instance of the type. Modern .NET's answer is `SafeHandle`, which
concentrates all the finalizer subtlety into a handful of carefully-audited
BCL types so that your code needs none of it.

## `SafeHandle`, and the bug it was invented for

Before `SafeHandle`, a class holding an `IntPtr` with a finalizer had a real
race. Consider a method that P/Invokes with `this.handle` as an argument. The
JIT can determine that `this` is no longer referenced after the field is read —
the object is unreachable while the native call is still in flight — so the
collector may run the finalizer, which closes the handle, *while the operating
system is using it*. The handle value can then be recycled by the OS and handed
to another thread, so the in-flight call now operates on somebody else's file.

`SafeHandle` fixes this with a reference count and critical finalization: the
marshaller increments the count around the call, the finalizer waits, and the
handle cannot be closed mid-call. `CriticalFinalizerObject` also guarantees the
finalizer runs even during some forms of shutdown. This is deep, subtle work
you should reuse rather than reproduce, and it is the strongest single argument
for "do not write finalizers".

## The `using` forms, precisely

- **Statement form** — `using (var x = ...) { }` — disposes at the closing
  brace of its own block. Scope is explicit and narrow.
- **Declaration form** — `using var x = ...;` (C# 8) — disposes at the end of
  the *enclosing* block. Less nesting, and easy to accidentally hold something
  far longer than intended in a long method.
- **`await using`** — binds to `IAsyncDisposable.DisposeAsync`. When a type
  implements both interfaces, the syntax you write decides which runs.
- **Pattern-based disposal for ref structs** — a `ref struct` cannot implement
  an interface, so the compiler accepts a public `Dispose()` method by shape.
  That is how `using` works on things like enumerators over spans.

All of them lower to `try`/`finally`. Which means the release runs on the
exception path, on the `return` path, and on a `goto` out of the block, and it
means two nested `using`s are two nested `finally` blocks, hence reverse order.

## The exception that eats the exception

C# has no equivalent of Java's try-with-resources suppression list. If the body
throws and the generated `finally` calls a `Dispose` that also throws, the
second exception propagates and the first is simply gone — no inner exception,
no trace, nothing in the log to say a failure was replaced.

This is worth knowing because it produces a specific and confusing symptom:
production errors whose stack traces all point into cleanup code, with no sign
of the real failure. The mitigation is that `Dispose` should try very hard not
to throw — the guidance is explicit about this — and, where you are writing the
scope yourself, to catch around the disposal and combine:

```csharp
Exception? primary = null;
try { body(); }
catch (Exception ex) { primary = ex; throw; }
finally
{
    try { resource.Dispose(); }
    catch (Exception cleanup)
    {
        if (primary is null) throw;
        throw new AggregateException(primary, cleanup);   // deliberate, not accidental
    }
}
```

## `IAsyncDisposable`, and why `ValueTask`

Added in C# 8 alongside async streams, for the case where release genuinely
performs I/O: flushing a buffered writer, sending a close frame on a WebSocket,
committing or rolling back a transaction. Its `DisposeAsync` returns
`ValueTask` rather than `Task` because most disposals complete synchronously —
the buffer is empty, the state is already closed — and allocating a `Task` per
disposal for the common case would be a per-object cost with no benefit.

`ValueTask` has rules that `Task` does not: await it once, do not store it, do
not `WhenAll` a collection of them without converting to `Task` first. Those
rules exist because a `ValueTask` may be backed by a pooled source that is
recycled after the first await.

The genuinely difficult case is a type that must be usable from both worlds. If
the async work is optional — flush only if there is something buffered — a
synchronous `Dispose` that skips it is honest. If it is not optional, the right
answer is usually to implement `IAsyncDisposable` alone and let the compiler
prevent misuse. Implementing `Dispose` as a blocking wait on `DisposeAsync` is
the option that looks convenient and deadlocks under a synchronisation context,
starves the thread pool under load, and hides the problem until production.

## Event handlers: the leak that looks like nothing

The most common "memory leak" in .NET has nothing to do with unmanaged
resources. A static or long-lived object exposes an event; a short-lived object
subscribes; the delegate holds a reference to the subscriber; the subscriber is
now reachable for as long as the publisher lives. Every window, view model,
request-scoped service or cache entry that subscribed and never unsubscribed
stays in gen2 forever, with everything it references.

Three practical defences. Return an `IDisposable` from your subscription API,
so the symmetry is enforced by `using` and by the disposal of the owner. Use
weak event patterns where the publisher genuinely outlives everything —
`WeakEventManager` in WPF, or a hand-rolled weak subscription like the cache
from sector C1. Or avoid the event entirely and pass a callback whose lifetime
is obvious.

## When not to implement `IDisposable`

Implementing it has costs: it propagates. If a type is disposable, every type
that owns one should be disposable, and so on up the graph, until a `using`
appears somewhere sensible or somebody quietly stops disposing. So do not
implement it for tidiness. Specifically:

- Do not implement it to "clear" managed fields. Setting references to null in
  `Dispose` does nothing the collector was not already going to do.
- Do not implement it on a type registered as a DI singleton unless the
  container owns the lifetime — and then never dispose it yourself.
- Do not implement it on a type whose only "resource" is memory, however much
  memory. That is what the collector is for.
- Think twice on interfaces. Putting `IDisposable` on an abstraction forces
  every implementation to be disposable and every consumer to write disposal
  code, including the implementations that hold nothing at all. It is sometimes
  right — `HttpMessageHandler` — and it is a real coupling decision either way.
