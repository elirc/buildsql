## Hint 1

The dictionary key is `typeof(T)` and the value is the list of handlers for
that type. `Subscribe<T>` finds or creates the list and adds the handler;
`SubscriberCount<T>` and `Unsubscribe<T>` look it up and do nothing when it is
missing.

`TryGetValue` is the tool for all three - a missing key is normal here, not an
error.

## Hint 2

```csharp
if (!_handlers.TryGetValue(typeof(T), out List<Delegate>? forType))
{
    forType = new List<Delegate>();
    _handlers[typeof(T)] = forType;
}

forType.Add(handler);
```

The list has to be `List<Delegate>` because different slots hold different
`Action<T>` types, so `Publish<T>` casts each entry back with
`((Action<T>)entry)(message)`. That cast cannot fail: the key is what
guarantees the type.

## Hint 3

Re-entrancy is the last requirement, and it is the one the gate builds a
specific handler for. A handler that calls `Subscribe` while the message is
being delivered adds to the very list you are iterating, and `foreach` over a
`List<T>` that changed underneath it throws `InvalidOperationException`.

Take a copy before you start delivering - `ToArray()` is enough - and return
that copy's length. Beyond fixing the exception, it also settles a design
question you would otherwise have to answer case by case: this message goes to
the handlers registered when it was published, and nobody else.
