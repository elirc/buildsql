## Hint 1

Both methods are one chain each, and both chains are the same four steps in a
different order: keep some rows, sort them, turn each row into something
smaller, produce a list.

Write the clauses in the order LINQ wants them, which is not the order SQL
writes them: the source comes first, then `Where`, then the ordering, then
`Select`.

## Hint 2

```csharp
return orders
    .Where(order => /* the condition */)
    .OrderByDescending(order => order.Amount)
    .ThenBy(order => order.Customer)
    .Select(order => order.Customer)
    .ToList();
```

`ThenBy` is the tie-break. Writing a second `OrderBy` instead throws the first
ordering away completely — it re-sorts from scratch — which is the single most
common LINQ ordering bug.

`SortedLabels` sorts by customer first and then by amount *descending* within
each customer, and projects to `$"{order.Customer}: {order.Amount}"`.

## Hint 3

"At least `minimum`" is `>=`. The gate passes a minimum equal to one of the
amounts precisely to check which comparison you used.

`ToList()` at the end is what turns the query into the `List<string>` the
signature promised. Without it you have an `IEnumerable<string>` and the
compiler will tell you so — and *why* that final step exists at all is exactly
what ex3 is about.

Left to you: `OrderByDescending(...).ThenBy(...)` can also be written as
`OrderBy(o => (-o.Amount, o.Customer))` with a tuple. Try it if you like;
decide which one you would rather read next year.
