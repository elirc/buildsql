## Hint 1

Three outcomes, and the third one is a trap: cancellation must **not** be
reported as a failure. That means the order of your catch blocks matters, and a
bare `catch` that comes first will eat it.

Start with the happy path — wait for everything, sum it, format it — and then
add the two failure routes around it.

## Hint 2

```csharp
try
{
    int[] results = await Task.WhenAll(work).WaitAsync(token);
    return $"ok: {results.Sum()}";
}
catch (OperationCanceledException)
{
    throw;                       // not ours to report
}
catch
{
    // one of them faulted: find out which
}
```

`throw;` with no operand rethrows the current exception with its stack intact —
lesson 12's rule, and the reason this catch block is two words rather than a
new exception.

To find the culprit: `work.First(task => task.IsFaulted)`, whose `Exception` is
an `AggregateException` wrapping the real one in `InnerException`.

## Hint 3

Why you cannot just read the exception `WhenAll` threw: awaiting `Task.WhenAll`
rethrows only the **first** exception, and "first" there means first to fail in
time, not first in your list. The prompt asks for the first faulted task in
*list* order, so you have to look at the tasks themselves — which is also how
you would collect *all* the failures (`task.Exception` on each faulted one) for
a real log.

Note also that `WhenAll` waits for every task even after one has faulted. That
is usually what you want (no orphaned work) and occasionally not (fail fast),
and `WhenAny` plus a cancellation token is the other pattern.

Left to you: whether to finish with a `switch` expression over the exception
type. With one interesting case it is arguably overkill; with three or four —
timeout, unauthorised, not-found — it is much easier to read than an `if`
ladder, and pattern matching over exception types is a pleasant way to end
this course.
