## Hint 1

Each method groups by region and then asks the group a question: `Sum`, `Max`,
or "which item was biggest". The ordering in `UnitsByRegion` is over the
grouped rows, not over the sales - so the total has to exist before you can
sort by it.

Projecting the group into an anonymous type first makes that easy to say.

## Hint 2

```csharp
sales
    .GroupBy(sale => sale.Region)
    .Select(group => new { Region = group.Key, Total = group.Sum(s => s.Units) })
    .OrderByDescending(row => row.Total)
    .ThenBy(row => row.Region, StringComparer.Ordinal)
```

`BestSellerByRegion` is the interesting one: you want the *item* with the
largest units, not the largest units. `Max` gives the number and throws away
the row, so either sort the group and take the first, or use `MaxBy` - and if
you use `MaxBy`, decide what it does about the tie the gate builds into the
south region before you rely on it.

The tie is deliberate. Without the explicit tie-break, the answer would depend
on the order the sales happened to be in.
