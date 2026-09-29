@@PROMPT@@
## Exercise 7 - a subscription is a resource

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex7.cs`.

`EventBus` is a long-lived publisher. Subscribers are short-lived. Every
subscription that is never removed keeps its subscriber alive for as long as
the bus lives, which is the most common managed memory leak in .NET.

- `IDisposable EventBus.Subscribe(Action<string> handler)` — registers the
  handler and returns a token whose `Dispose` unsubscribes.
- `void Publish(string message)` — invokes every current subscriber, in
  subscription order. A handler that throws must not stop the others; collect
  the failures and throw a single `AggregateException` **after** everyone has
  been called.
- `int SubscriberCount`.
- The token is idempotent: disposing it twice removes one subscription.
- Publishing while a handler unsubscribes must not throw
  `InvalidOperationException` — iterate a snapshot.

```
var bus = new EventBus();
var seen = new List<string>();
using (bus.Subscribe(seen.Add))
{
    bus.Publish("one");
    bus.SubscriberCount;   // 1
}
bus.SubscriberCount;       // 0
bus.Publish("two");        // nobody hears it
seen                       // ["one"]

var token = bus.Subscribe(_ => throw new FormatException("bad"));
bus.Subscribe(seen.Add);
bus.Publish("three");      // AggregateException with one FormatException...
seen                       // ...but "three" still reached the second handler
```

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex7
```
@@HINTS@@
## Hint 1

The leak, stated precisely: a delegate holds a reference to its target object,
the bus holds the delegate, so the bus holds the subscriber. Your code has
dropped every reference to the subscriber and the collector can still see one,
through the invocation list. Returning a token makes removal something a
`using` can guarantee.

## Hint 2

Store the handlers in a list and have the token capture what it needs to
remove:

```csharp
private sealed class Token(EventBus bus, Action<string> handler) : IDisposable
{
    private bool removed;
    public void Dispose()
    {
        if (removed) return;
        removed = true;
        bus.handlers.Remove(handler);
    }
}
```

Removing by the *same delegate instance* is what makes this work — which is why
`bus.Fired -= (s, e) => ...` with a fresh lambda removes nothing.

## Hint 3

`Publish` iterates a snapshot (`handlers.ToArray()`) so a handler that
unsubscribes mid-publish does not invalidate the enumerator. Then each handler
gets its own `try`/`catch`, failures go into a list, and the aggregate is
thrown at the end. Decide whether a handler that unsubscribed *during* this
publish should still be called — the snapshot says yes, and that is a
defensible choice you should be able to state.
@@IMPORTANT@@
## Hint 1

Compare the two subscription styles before writing anything. `bus.Fired +=
Handler` requires the subscriber to remember to write `-= Handler` with a
matching delegate, on every path including exceptional ones. A returned
`IDisposable` makes the removal an object the compiler can dispose for you.
That is the entire argument for the pattern, and it is why `IObservable<T>`,
`ILogger.BeginScope` and `CancellationToken.Register` all return one.

## Hint 2

The same shape exists in the BCL and is worth recognising:

```csharp
using CancellationTokenRegistration registration = token.Register(Cancel);
using IDisposable scope = logger.BeginScope("request {Id}", id);
```

Both return a token whose only job is undoing the registration. Neither
"releases a resource" in the file-handle sense, and both are correctly
`IDisposable`.

## Hint 3

The aggregate rule has an ordering consequence people miss: every handler runs
*before* anything is thrown, so a failure in the first subscriber cannot
silently deny the message to the third. Build the failure list as you go and
throw once at the end — and decide what `Publish` should do when exactly one
handler failed, since `AggregateException` with a single inner is still an
`AggregateException` and the gate will check which you chose.
@@REF@@
// v3cc03_deterministic_cleanup / ex7 - a subscription is a resource.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Exercise 7".

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>
/// A long-lived publisher. Subscribe returns a token because the alternative -
/// asking every subscriber to remember a matching -= on every path - is the
/// most common managed memory leak in .NET.
/// </summary>
public sealed class EventBus
{
    private readonly List<Action<string>> handlers = new();

    public int SubscriberCount => handlers.Count;

    public IDisposable Subscribe(Action<string> handler)
    {
        ArgumentNullException.ThrowIfNull(handler);

        handlers.Add(handler);
        return new Subscription(this, handler);
    }

    public void Publish(string message)
    {
        ArgumentNullException.ThrowIfNull(message);

        // A snapshot: a handler is allowed to unsubscribe while we are
        // publishing, and mutating the list mid-foreach would throw.
        Action<string>[] snapshot = handlers.ToArray();

        List<Exception>? failures = null;
        foreach (Action<string> handler in snapshot)
        {
            try
            {
                handler(message);
            }
            catch (Exception ex)
            {
                // One bad subscriber must not deny the message to the rest.
                (failures ??= new List<Exception>()).Add(ex);
            }
        }

        if (failures is not null)
        {
            throw new AggregateException("one or more subscribers failed", failures);
        }
    }

    private sealed class Subscription : IDisposable
    {
        private readonly EventBus bus;
        private readonly Action<string> handler;
        private bool removed;

        public Subscription(EventBus bus, Action<string> handler)
        {
            this.bus = bus;
            this.handler = handler;
        }

        public void Dispose()
        {
            if (removed)
            {
                return;   // idempotent: two disposals remove one subscription
            }

            removed = true;

            // Removing the same delegate instance is what makes this work.
            bus.handlers.Remove(handler);
        }
    }
}
