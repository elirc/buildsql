## Hint 1

Run the supplied `NaiveTotal` in your head first with three handlers returning
1, 2 and 3. All three run. The answer is 3. Nothing was skipped - the first two
results were simply discarded, because a single call can only hand back a
single value.

The fix is the same tool as ex6: walk the invocation list yourself.

## Hint 2

```csharp
foreach (Delegate entry in handlers.GetInvocationList())
{
    results.Add(((Func<int>)entry)());
}
```

The cast is safe because every entry in a `Func<int>`'s invocation list is a
`Func<int>` - the delegate type is what makes the list well-typed in the first
place.

Write `Total` in terms of `AllVotes` rather than duplicating the loop. And
notice what the gate checks with the same handler subscribed twice: the
invocation list is a list, so it votes twice. If that strikes you as wrong for
a poll, that is the real lesson here - an event is a poor way to ask a question
you need every answer to.
