# Reading - csharp/v3cc03_deterministic_cleanup

## Notes

**`Dispose` is a promise about timing, not about memory.** Calling it does not
free the object; the collector still does that whenever it likes. What it frees
is everything the object was holding on someone else's behalf — a handle, a
lock, a pooled connection, a subscription. The test for "should this type be
disposable" is not "is it big" but "does something outside the process, or
outside this object's lifetime, notice if release is late".

**Idempotence is part of the contract.** The documented rule is that `Dispose`
may be called more than once and every call after the first must do nothing.
This is not defensive programming, it is required: `using` may dispose an
object a caller has already disposed, and `CompositeDisposable`-style
containers call it on everything they hold. A `Dispose` that throws on a second
call is a bug even if it never fires in your tests.

**The `disposing` flag means "is the rest of the world still alive".** On the
`Dispose()` path it is true and you may touch other managed objects. On the
finalizer path it is false: the objects you reference may already have been
finalized, they may be being finalized concurrently, and the thread is not
yours. Which is why the only thing a finalizer should do is release something
unmanaged, and why a `SafeHandle` doing it for you is better than doing it
yourself.

**`using` declarations dispose at the end of the enclosing scope**, not at the
end of the statement, and not where you might visually expect:

```csharp
using var connection = Open();
using var command = connection.CreateCommand();
// ...both disposed here, command first, at the closing brace of the method
```

Reverse order is a consequence of the nesting, and it matters: the command must
go before the connection it belongs to.

**A `Dispose` that throws inside a `finally` destroys evidence.** If the body
threw first, the exception from the `finally` replaces it, and the stack trace
you get points at your cleanup rather than at the failure. C# has no equivalent
of Java's suppressed-exception list, so the fix is to catch in the `finally`
yourself and combine deliberately — which is what the challenge builds.

**`IAsyncDisposable` exists because flushing is I/O.** A buffered writer's
release genuinely has to write bytes, and doing that from a synchronous
`Dispose` means blocking a thread on I/O or, worse, `.GetAwaiter().GetResult()`
on an async call — sync-over-async, the deadlock generator. `await using` gives
you the async path with the same `finally` guarantee.

**The dispose order between the two interfaces is decided by the syntax.**
`await using` prefers `DisposeAsync`; a plain `using` calls `Dispose`. A type
implementing both must make both correct, and must not implement one by
blocking on the other.

## ex1

Really testing: what each piece of the pattern is *for*. The public `Dispose`
is the caller's entry point; `Dispose(bool)` is the shared implementation;
`virtual` exists so a subclass can extend it; the finalizer is the safety net
for the unmanaged handle; `SuppressFinalize` takes a properly-disposed object
off the finalization queue. The classic mistake is a subclass overriding
`Dispose(bool)` and forgetting `base.Dispose(disposing)`, which silently leaks
the base's resources. The second is writing all of it for a type that owns only
managed objects, where the finalizer is pure cost.

## ex2

Really testing: that "disposed" is a state, not an absence.
`ObjectDisposedException.ThrowIf(disposed, this)` is the .NET 8 one-liner and
it captures the type name correctly, which matters when the exception reaches a
log. The classic mistake is only guarding some members, so a disposed object
half-works — the worst failure mode, because it produces wrong answers instead
of an exception. Note the asymmetry: every *other* member throws after
disposal, and `Dispose` itself must not.

## ex3

Really testing: ownership as an explicit decision. Wrapping a stream does not
make you its owner, and the BCL takes this so seriously that `StreamReader`,
`StreamWriter`, `BinaryReader`, `GZipStream` and `CryptoStream` all have a
`leaveOpen` constructor parameter. The classic mistake is a short-lived wrapper
closing a long-lived stream — you write a header with one writer, dispose it,
and the second writer finds a closed stream. The rule: dispose what you
created, do not dispose what you were handed, and make it a constructor
argument when the caller should choose.

## ex4

Really testing: that release can be real work. `DisposeAsync` must flush the
buffer before releasing, and it must do it exactly once — so the disposed flag
has to be set in the right place relative to the flush, or a concurrent second
call can flush a buffer that is already draining. The classic mistake is
`Dispose()` calling `DisposeAsync().GetAwaiter().GetResult()`, which blocks a
pool thread and, in a context with a synchronisation context, deadlocks
outright.

## ex5

Really testing: the two entry points and what `await using` selects. When a
type implements both, `await using` binds to `DisposeAsync` and `using` binds
to `Dispose`; the compiler does not warn you which one you got. The classic
mistake is a `using` on a type that is only `IAsyncDisposable` — that is a
compile error, which is the good case — or an `await using` on something whose
`DisposeAsync` is a lie that calls `Dispose` and returns a completed task. Also
worth noting: in library code, `DisposeAsync` should `ConfigureAwait(false)`
like any other await.

## ex6

Really testing: which exception the caller should see. When the body fails, the
body's exception is the interesting one; a disposal failure that follows is
context, not the headline. The classic mistake is the plain `try`/`finally`,
where the `finally`'s throw silently replaces the original and the stack trace
points at your cleanup code. Also being tested: reverse disposal order, and the
fact that a failure disposing the first resource must not prevent the second
from being disposed.

## ex7

Really testing: the most common managed memory leak there is. A publisher
holding a delegate holds the target object, so a long-lived event source keeps
every subscriber alive — the subscribers are unreachable from your code and
perfectly reachable from the event's invocation list. Returning an
`IDisposable` token makes unsubscribing symmetric with subscribing and gives
you `using` for scoped subscriptions. The classic mistake is unsubscribing with
a *different* delegate instance: `bus.Fired -= Handler` works because a method
group produces an equal delegate, but `-= (s, e) => ...` with a fresh lambda
removes nothing at all.

## ex8

Really testing: `Dispose` as "give it back" rather than "destroy it". A pooled
object's `Dispose` resets state and returns it, which makes `using` the natural
syntax for a rented resource. The classic mistake is the double return, which
puts one buffer in the pool twice and hands it to two owners who will
cheerfully write over each other with no exception anywhere. Detect it: a
returned buffer must know it is in the pool and refuse a second return.

## Further reading

- [Implementing a Dispose method](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose) - the pattern and when the full version is needed.
- [Implementing DisposeAsync](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-disposeasync) - the async half, including the both-interfaces case.
- [SafeHandle](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.safehandle) - why you should almost never write a finalizer.
- [ObjectDisposedException.ThrowIf](https://learn.microsoft.com/en-us/dotnet/api/system.objectdisposedexception.throwif) - the guard, in one line.
- [using statement](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/using) - the declaration form and its scope rules.
- [Events and memory leaks](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/events/how-to-subscribe-to-and-unsubscribe-from-events) - subscription lifetime.
