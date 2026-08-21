## Hint 1

One LINQ chain and one `TypedResults.Ok`. The chain has three steps: sort,
reshape, run.

The method is declared `Task<IResult>`, so make it `async` and `await` the
query — a synchronous `ToList()` would block a thread for the whole round trip.

## Hint 2

`db.Products` is an `IQueryable<Product>`. `OrderBy(p => p.Name)` sorts,
`Select(p => new ProductSummary(...))` reshapes, and `ToListAsync()` is the
moment SQL actually gets sent.

The order of those three matters for what the SQL looks like: put the `Select`
before `ToListAsync` and only three columns are fetched; put it after and you
have already loaded everything.

`ToListAsync` needs `using Microsoft.EntityFrameworkCore;` at the top of the
file.

## Hint 3

```csharp
var products = await db.Products
    .OrderBy(/* … */)
    .Select(p => new ProductSummary(p.Id, p.Name, p.PriceCents))
    .ToListAsync();

return TypedResults.Ok(products);
```

If the gate complains that `category` is in the body, you returned the entities
themselves. If it complains about the order, the `OrderBy` is missing — the ids
came back in a sequence that happened to look sorted.
