## Hint 1

Lesson 01's ex1, with a database behind it. Find the one row whose `Id`
matches, then decide what to return when there is none.

No projection this time — the gate wants `category` in the body, so hand back
the entity.

## Hint 2

`await db.Products.FirstOrDefaultAsync(p => p.Id == id)` gives you a
`Product?`: the row, or `null`. Its cousins behave differently on the empty
case — `FirstAsync` throws, which would be a 500 rather than a 404 — so this is
the one you want.

Then the same conditional you wrote in lesson 01: `NotFound()` or `Ok(product)`.

## Hint 3

```csharp
var product = await db.Products.FirstOrDefaultAsync(/* … */);
return product is null ? TypedResults.NotFound() : TypedResults.Ok(product);
```

Worth trying afterwards, even though the gate does not require it: swap
`FirstOrDefaultAsync` for `FindAsync(id)` and read the docs on why it can
sometimes answer without querying at all.
