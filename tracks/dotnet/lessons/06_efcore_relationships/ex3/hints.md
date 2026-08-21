## Hint 1

Delete the loop. All of it — the `foreach`, the two awaits inside it, the
accumulator list. What replaces it is a single query whose `Select` describes
the answer.

Count the queries the current version makes before you start: one for the
orders, then two per order. Four orders, nine commands.

## Hint 2

Everything you need is reachable from an `Order` as an expression:

- the customer's name is `o.Customer!.Name` — a join
- the number of lines is `o.Lines.Count` — a correlated `COUNT`
- the total is `o.Lines.Sum(l => l.Quantity * l.UnitPriceCents)` — a correlated
  `SUM`

None of that runs in your process. It is an expression tree EF turns into one
`SELECT`, so the `!` on `Customer` is only there to quiet the compiler.

Keep the `OrderBy(o => o.Id)` before the `Select`.

## Hint 3

```csharp
var summaries = await db.Orders
    .OrderBy(o => o.Id)
    .Select(o => new OrderTotals(
        o.Id,
        o.Customer!.Name,
        /* how many lines? */,
        /* quantity * unit price, summed */))
    .ToListAsync();
```

One `await`, one command. If the gate still reports more than one, check for a
stray `ToListAsync()` earlier in the chain — everything after that boundary runs
in memory, and anything it touches has to be fetched separately.
