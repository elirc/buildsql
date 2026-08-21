## Hint 1

Both handlers have the same two beats: does the thing in the route exist, and
what is on the other side of the relationship.

The existence check has to be separate. "This product has no tags" and "there is
no such product" both produce an empty list, and the gate asks you to tell them
apart.

## Hint 2

`AnyAsync(p => p.Id == id)` answers the first question with a cheap `EXISTS`
query.

For the second, `SelectMany` walks a collection navigation and flattens it:

```csharp
db.Products.Where(p => p.Id == id).SelectMany(p => p.Tags)
```

…gives you an `IQueryable<Tag>`. From there it is `Select` the name, `OrderBy`,
`ToListAsync`. The second handler is the mirror image with `Tags` and
`t.Products`.

## Hint 3

```csharp
if (!await db.Products.AnyAsync(p => p.Id == id))
{
    return TypedResults.NotFound();
}

var names = await db.Products
    .Where(p => p.Id == id)
    .SelectMany(p => p.Tags)
    .Select(t => t.Name)
    .OrderBy(name => name)
    .ToListAsync();
```

Return the list of strings directly — `TypedResults.Ok(names)` serialises it as
a JSON array. Note that nothing in your code mentions the join table; EF is
managing it.
