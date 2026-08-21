## Hint 1

Two beats: does the order exist, then one projection over its lines.

You do not need to load the order to get its lines — `OrderLine` carries the
`OrderId` foreign key, so you can filter on that directly.

## Hint 2

`AnyAsync(o => o.Id == id)` for the 404.

Then filter `db.OrderLines` by `OrderId`, and project each line into a
`LineDetail`. The product's name is one hop away: `l.Product!.Name`, which EF
turns into a join.

Careful with the ordering. It has to happen while EF can still see columns —
that is, **before** the `Select` that builds the record.

## Hint 3

```csharp
var lines = await db.OrderLines
    .Where(l => l.OrderId == id)
    .OrderBy(l => l.Product!.Name)
    .Select(l => new LineDetail(
        l.Product!.Name,
        l.Quantity,
        /* quantity * unit price */))
    .ToListAsync();
```

Order by `l.Product!.Name` and not by `l.ProductName` — the second one is a
property of the record you have not built yet, and EF cannot translate it.
