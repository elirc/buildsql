## Hint 1

`add` and `remove` are just method bodies. Inside them, `value` is the handler
being subscribed or unsubscribed, and `_entered` is the delegate field the
compiler would normally have generated for you.

So `add` starts with `_entered += value;` and `remove` with
`_entered -= value;`. The counting is the exercise.

## Hint 2

Do not write `Subscribers++` and `Subscribers--`. Derive the number instead:

```csharp
private int CurrentCount()
{
    return _entered?.GetInvocationList().Length ?? 0;
}
```

Call it at the end of both accessors. That handles the stranger case for free -
removing a handler that was never on the list leaves the delegate unchanged, so
the recomputed count is unchanged too, whereas a blind decrement would take it
to -1 and the counter would be lying from then on.

`PeakSubscribers` only ever moves up, so it is updated in `add` and never in
`remove`.
