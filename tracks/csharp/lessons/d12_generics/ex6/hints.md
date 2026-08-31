## Hint 1

Both methods have more than one type parameter, and the compiler infers all of
them from the arguments - so callers write `Maps.Map(items, x => x.Length)`
with no angle brackets at all.

`Func<TSource, TResult>` is a delegate: a method passed as a value. Calling it
is ordinary call syntax - `selector(item)`.

## Hint 2

`Map` is a loop:

```csharp
List<TResult> results = new List<TResult>();
foreach (TSource item in items) results.Add(selector(item));
return results;
```

`ToDictionary` is the same loop with two projections, and one decision to make:
what happens on a duplicate key. The specification here says the later entry
wins, which is `dictionary[key(item)] = value(item);` - the indexer replaces.
`Add` would throw instead, and LINQ's own `ToDictionary` does exactly that,
which is worth knowing before it surprises you in production.

The `where TKey : notnull` constraint is required because
`Dictionary<TKey, TValue>` demands it. Constraints propagate: a generic method
that uses a constrained type must repeat the constraint.

Note how much the type parameters are doing for readability here. `TSource`,
`TKey`, `TValue` and `TResult` are the BCL's own names for these roles, and
following them makes a signature readable at a glance.
