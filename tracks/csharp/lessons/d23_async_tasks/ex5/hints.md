## Hint 1

Both methods are one or two lines. Write them the obvious way and then check
the properties the gate measures: has the mapping function run while the task
is still pending? Has the second step been *started*?

`await` gives you both answers for free if the awaits are in the right places.

## Hint 2

```csharp
public static async Task<TOut> MapAsync<TIn, TOut>(Task<TIn> task, Func<TIn, TOut> map)
{
    return map(await task);
}
```

The `await` finishes before `map` is called, so the function cannot run early.

```csharp
TIn value = await task;
return await next(value);
```

`next` is not even called until the first task produced a value - which is also
why a failure in the first step means the second never runs, with no `if`
anywhere. If you find yourself reaching for `ContinueWith`, notice how much
harder it is to get that failure behaviour right by hand; that is why it has
largely disappeared from modern code.
