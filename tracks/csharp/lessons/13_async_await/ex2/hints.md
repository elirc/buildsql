## Hint 1

Both methods are one `await Task.WhenAll(...)` and one line of LINQ.

The interesting fact to notice is what order the results come back in when the
tasks finish in a completely different order from the one you passed them in.
Predict it before the gate tells you.

## Hint 2

```csharp
int[] results = await Task.WhenAll(tasks);
return results.Sum();
```

`Task.WhenAll` accepts an `IEnumerable<Task<T>>` and returns a `Task<T[]>`.
The array is in the **input** order, always — completion order does not affect
it at all.

`JoinAsync` is the same call plus `string.Join(", ", results)`.

## Hint 3

`Task.WhenAll` over an empty sequence completes immediately with an empty
array, so `Sum()` gives 0 and no special case is needed.

One thing worth knowing that the gate does not check: `WhenAll` enumerates the
sequence you hand it once, immediately. If that sequence is a lazy LINQ query
that *creates* the tasks (`items.Select(i => FetchAsync(i))`), enumerating it
is what starts them — and enumerating it twice would start them twice. This is
lesson 10 ex3's multiple-enumeration trap with real consequences, and the fix
is the same: `.ToList()` before you pass it.

Left to you: `Task.WhenAny` is the sibling that completes when the *first* one
does. Read its signature and work out why it returns `Task<Task<T>>` rather
than `Task<T>`.
