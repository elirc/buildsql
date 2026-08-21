## Hint 1

Both tasks are already running when you receive them. You are not starting
work; you are deciding how to wait for it.

Awaiting them one after the other works and is not wrong here — but say out
loud what it means before you write it, because it is the difference between
"two seconds" and "one second" when the tasks are real network calls.

## Hint 2

`Task.WhenAll(first, second)` returns a task that completes when both do, and
for `Task<int>` inputs it hands back an `int[]` of the results in the order you
passed them:

```csharp
int[] results = await Task.WhenAll(first, second);
return results[0] + results[1];
```

`InOrderAsync` is the same wait, then a string built from the two results in
parameter order.

## Hint 3

The gate checks that your returned task is **not** finished until both inputs
are, which is what `await` gives you and what returning early would not.

For `InOrderAsync`, after `await Task.WhenAll(...)` both tasks are complete, so
`first.Result` is safe — reading `.Result` on an *already completed* task never
blocks and never wraps. (It is reading `.Result` on a task that has not
finished that blocks the thread, which is ex4's subject.) Awaiting each one
again after the `WhenAll` is equally fine and reads better to some people.

Left to you: `await first; await second;` — two sequential awaits — passes this
gate too. Work out why it still gives the right answer here, and when it would
not be acceptable.
