## Hint 1

Both methods start with the same `GroupBy`. The first then *filters the
groups*; the second aggregates each one.

Filtering after a `GroupBy` is `HAVING`. Filtering before it is `WHERE`. They
are different questions and they give different answers, so be clear which one
the prompt is asking for.

## Hint 2

```csharp
sales.GroupBy(sale => sale.Category)
     .Where(group => group.Count() >= minCount)     // HAVING
     .Select(group => group.Key)
     .OrderBy(category => category)
```

`group.Key` is the category name; `group.Max(sale => sale.Amount)` is the
biggest sale inside one group.

## Hint 3

Try writing the first method with the `Where` *before* the `GroupBy` and work
out what it would mean: "keep the sales that ... " — there is no per-sale
condition that expresses "its category has at least three sales", because that
fact belongs to the group, not the row. That impossibility is exactly why SQL
has both `WHERE` and `HAVING`.

Left to you: whether to order before or after the `Select`. Ordering by
`group.Key` and then selecting it is identical here; when the projection is
expensive, ordering first means projecting fewer items.
