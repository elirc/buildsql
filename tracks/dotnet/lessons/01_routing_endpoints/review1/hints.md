## Hint 1

This is ex1 and ex2 again with `Catalog.Products` instead of `Catalog.Orders`.
The routes are already mapped for you this time, so both failures are 500s from
the two unimplemented handlers.

The only new wrinkle: the key is a `string` sku, so there is no `:int`
constraint doing free validation for you.

## Hint 2

`ListProducts` sorts by `PriceCents` ascending and returns the whole list — one
LINQ chain, no filtering, no 404 (an empty catalogue would still be a valid
200).

`GetProduct` is the ex1 pattern exactly: `FirstOrDefault`, then null-check into
`NotFound` or `Ok`.

## Hint 3

```csharp
private static IResult ListProducts() =>
    TypedResults.Ok(Catalog.Products.OrderBy(/* … */).ToList());
```

For `GetProduct`, compare `p.Sku` to the route parameter with `==`. String
comparison in C# is ordinal and case-sensitive by default, which is what you
want for an identifier.
