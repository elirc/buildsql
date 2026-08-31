## Hint 1

`Task.WhenAny(a, b)` returns a task whose result is **the task that finished**,
not that task's result. So there are two awaits: one for the race, and one for
the winner's value.

For `WinnerAsync` you do not need the value at all - only which task it was.

## Hint 2

```csharp
Task<string> winner = await Task.WhenAny(first, second);
return await winner;                                  // FirstAsync
return ReferenceEquals(winner, first) ? "first" : "second";   // WinnerAsync
```

`ReferenceEquals` is the right comparison: `WhenAny` hands back one of the very
objects you passed in.

The assertion worth pausing on is the one about the loser. `WhenAny` does not
cancel it, does not dispose it and does not wait for it - it is still pending
and its work is still running. In a real timeout that is exactly the situation:
you have stopped waiting, not stopped working, and if the loser eventually
fails with nobody watching you have an unobserved exception.
