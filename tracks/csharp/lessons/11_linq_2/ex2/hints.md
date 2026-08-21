## Hint 1

Two joins, and the whole exercise is which one drops rows.

`SaleLabels` wants one line per sale, so start from `sales` and match each one
to its customer. `SaleCounts` wants one line per customer *including the ones
with nothing*, so start from `customers` — and a plain `Join` will not do it.

## Hint 2

`Join` takes four arguments: the other sequence, the key on the left, the key on
the right, and what to make from each matched pair.

```csharp
sales.Join(
    customers,
    sale => sale.CustomerId,
    customer => customer.Id,
    (sale, customer) => /* the pair */)
```

`GroupJoin` has the same shape, but the last lambda receives the outer row and
**a group** of matching inner rows — empty when there are none. That empty group
is your LEFT JOIN.

## Hint 3

Ordering by sale id in the first method needs the id to survive the projection,
so project to an anonymous type holding both the id and the label, order, and
then select the label. Projecting straight to the label throws away what you
need to sort by — lesson 10's "order before you narrow" again.

The `zed: 0` line is the whole point of the second method. In SQL you would
write `LEFT JOIN ... GROUP BY`; here `GroupJoin` hands you the same thing
without the join-then-regroup dance.

Left to you: LINQ's other way to write a left join is
`GroupJoin(...).SelectMany(g => g.Sales.DefaultIfEmpty(), ...)`, which gives you
one row per match with nulls for the missing side — literally what SQL returns.
Try it once so the shape is familiar when you meet it in EF Core.
