## Hint 1

Four beats: resolve the defaults, validate, count, fetch the page.

Both parameters are `int?` so that "not sent" is distinguishable from "sent as
0" — one is a default, the other is a 400.

Watch the arithmetic. Pages are 1-based and `Skip` is 0-based, so page 1 skips
nothing.

## Hint 2

```csharp
int wanted = page ?? 1;
int perPage = size ?? 2;
```

then one guard covering three conditions, then `await db.Products.CountAsync()`
for the total — that is a second query, and it is unavoidable if you want to
report a total.

For the page itself: `OrderBy`, then `Skip`, then `Take`, then `Select`, then
`ToListAsync`. The order of those five is not interchangeable.

## Hint 3

```csharp
var items = await db.Products
    .OrderBy(p => p.Name)
    .Skip((wanted - 1) * perPage)
    .Take(perPage)
    .Select(p => new ProductSummary(p.Id, p.Name, p.PriceCents))
    .ToListAsync();

return TypedResults.Ok(new ProductPage(items, total, wanted, perPage));
```

`ProductPage` is already declared in `Model.cs` with exactly those four
properties. If page 2 comes back with the first two rows, the `Skip` expression
is missing its `- 1`.
