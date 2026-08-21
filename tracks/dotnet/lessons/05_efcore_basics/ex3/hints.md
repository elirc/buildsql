## Hint 1

Two handlers, same three-beat rhythm: check, change the context, save.

For the create, validate *before* you touch `db` at all — the gate counts rows
after two rejected requests and expects nothing to have been inserted.

For the delete, you cannot remove a row you have not loaded, which is also
conveniently how you find out it does not exist.

## Hint 2

Create: build a `Product` from the request, `db.Products.Add(product)`, then
`await db.SaveChangesAsync()`. Only *after* that save does `product.Id` have a
real value — the database generated it — so build the `Location` string from it
afterwards.

Delete: `await db.Products.FindAsync(id)`, return `TypedResults.NotFound()` when
it is null, otherwise `db.Products.Remove(product)` and save, then
`TypedResults.NoContent()`.

`request.Category` is `string?`; the entity's `Category` is not nullable.

## Hint 3

```csharp
if (string.IsNullOrWhiteSpace(request.Name) || request.PriceCents <= 0)
{
    return TypedResults.BadRequest();
}

var product = new Product { Name = request.Name, /* … */ };
db.Products.Add(product);
await db.SaveChangesAsync();

return TypedResults.Created($"/l05/products/{product.Id}", product);
```

If the gate says the new product 404s on the next request, you called `Add` and
forgot `SaveChangesAsync` — nothing left the change tracker.
