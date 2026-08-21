## Hint 1

Default, validate, query. The query is ex1's chain with two changes: a
different sort, and a limit on how many rows come back.

The tie-breaker in the sort is not optional even though nothing in the seed data
ties — an ordering with ties is an ordering that can change between runs.

## Hint 2

`limit` is `int?`, so `limit ?? 3` gives you the default. Anything below 1 is a
`TypedResults.BadRequest()`.

`OrderBy(p => p.PriceCents)` then `ThenBy(p => p.Name)` then `Take(...)`, and
only then the `Select` and `ToListAsync`. Putting `Take` before the `OrderBy`
would mean "any three rows, then sort those three".

## Hint 3

```csharp
var items = await db.Products
    .OrderBy(/* … */)
    .ThenBy(/* … */)
    .Take(take)
    .Select(p => new ProductSummary(p.Id, p.Name, p.PriceCents))
    .ToListAsync();
```

Return the list itself with `TypedResults.Ok(items)` — this endpoint has no
wrapper object, unlike the challenge's page.
