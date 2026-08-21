## Hint 1

Start from `db.Customers`, not from `db.Orders`. That choice is what keeps Linus
in the results with a total of 0 — grouping orders by customer can only produce
rows for customers who have some.

The total is a sum of sums: over each of the customer's orders, over each of
that order's lines.

## Hint 2

Write it the obvious way first:

```csharp
.Select(c => new CustomerSpend(c.Id, c.Name, /* … */))
.OrderByDescending(s => s.TotalCents)
```

…and watch it fail with "The LINQ expression could not be translated". EF cannot
see inside your record's constructor, so it cannot turn `s.TotalCents` back into
a column for the `ORDER BY`.

The fix is to project into an **anonymous type** — which EF does understand —
sort, `Take`, and build the `CustomerSpend` records in memory afterwards.

## Hint 3

```csharp
var rows = await db.Customers
    .Select(c => new
    {
        c.Id,
        c.Name,
        Total = c.Orders.Sum(o => o.Lines.Sum(l => l.Quantity * l.UnitPriceCents)),
    })
    .OrderByDescending(row => row.Total)
    .ThenBy(row => row.Name)
    .Take(take)
    .ToListAsync();
```

…then one `Select` over `rows` in memory to make the records. That whole
queryable is still a single SQL command; the mapping afterwards costs nothing
because the rows are already here.
