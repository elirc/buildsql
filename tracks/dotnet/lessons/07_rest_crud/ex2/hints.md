## Hint 1

Four beats, in this order: collect validation errors, return them all if there
are any, check the sku conflict, then create.

The order matters. A request with a blank name *and* a duplicate sku should get
the 400 — you can see the blank name without touching the database.

## Hint 2

Build a `Dictionary<string, string[]>` and add an entry per broken field, keyed
exactly `"name"`, `"sku"` and `"priceCents"`. Do not return early on the first
one; the gate checks that all three keys are present when all three are wrong.

`TypedResults.ValidationProblem(errors)` turns that dictionary into a 400 with
`application/problem+json` and the `errors` object.

For the conflict, `await db.Widgets.AnyAsync(w => w.Sku == request.Sku)` and
`TypedResults.Problem(title:, detail:, statusCode: StatusCodes.Status409Conflict)`.

## Hint 3

```csharp
var errors = new Dictionary<string, string[]>();

if (string.IsNullOrWhiteSpace(request.Name))
{
    errors["name"] = ["Name is required."];
}
// … sku, priceCents …

if (errors.Count > 0)
{
    return TypedResults.ValidationProblem(errors);
}
```

Then the sku check, then build the `Widget`, `Add`, `SaveChangesAsync`, and
return `TypedResults.Created($"/l07/widgets/{widget.Id}", new WidgetDto(...))`.

Note the body is a **DTO**, not the entity you just saved — the leak rule from
ex1 applies to writes as well as reads.
