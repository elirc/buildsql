## Hint 1

`-=` compares delegates for equality, and two separately written lambdas with
identical bodies are two different objects. So a caller who wrote
`feed.Subscribe(item => Log(item))` has no way to remove that handler later
unless you give them one.

You have the handler right there in `Subscribe`. Return a lambda that closes
over it.

## Hint 2

```csharp
public Action Subscribe(Action<string> handler)
{
    _handlers += handler;

    bool removed = false;
    return () => { /* guard on removed, then _handlers -= handler; */ };
}
```

The `removed` flag is not paranoia. Without it, a caller who invokes the
unsubscriber twice takes a second copy of the same handler off the list - and
if somebody else had subscribed that same handler, you have just cancelled
their subscription instead.

Note that `_handlers` here is a plain delegate field rather than an `event`,
because `Subscribe` needs to modify it and `Publish` needs to invoke it. Decide
for yourself whether you would expose it as an event as well.
