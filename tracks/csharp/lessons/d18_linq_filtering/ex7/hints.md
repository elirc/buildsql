## Hint 1

Write the stages down in order before you write any code. There are five:
restrict by region, restrict by revenue, order, limit, project. Only one
arrangement of those is correct, and two of the wrong ones compile and return
plausible-looking rubbish.

Revenue is `Units * UnitPrice`, and you need it in the ordering as well as in
the filter.

## Hint 2

```csharp
sales
    .Where(sale => allowedRegions.Contains(sale.Region))
    .Where(sale => sale.Units * sale.UnitPrice >= minRevenue)
    .OrderByDescending(sale => sale.Units * sale.UnitPrice)
    .ThenBy(sale => sale.Product, StringComparer.Ordinal)
    .Take(count)
    .Select(sale => sale.Product)
    .ToList();
```

`Take` must come after the ordering, or you are sorting an arbitrary handful.
`Select` must come last, or the revenue you sort by has already been thrown
away.

Two of the sales earn exactly the same revenue. Without the `ThenBy` the answer
would depend on the order the input happened to arrive in - the kind of test
that passes until somebody inserts a row.

Two `Where` calls or one with `&&` is your choice; they cost the same. Decide
which one a reader would rather meet.
