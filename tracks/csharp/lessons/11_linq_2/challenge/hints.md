## Hint 1

Four of this lesson's operators in one chain, in this order: join the sales to
their customers, group by customer, sum each group, rank and take.

Then the same "what if there is nothing" decision as lesson 10's challenge.

## Hint 2

Start from `sales` and join to `customers`, projecting just what the rest needs
— the customer's name and the amount:

```csharp
sales.Join(customers,
        sale => sale.CustomerId,
        customer => customer.Id,
        (sale, customer) => new { customer.Name, sale.Amount })
     .GroupBy(row => row.Name)
     // ... sum, order, take, format
```

Grouping by name after the join is what turns five sales into three customers.

## Hint 3

Starting from `sales` rather than from `customers` is what excludes zed
automatically — an inner join drops the customer with nothing to join to, which
is precisely the specification here. If you started from `customers` with a
`GroupJoin`, zed arrives with a total of 0 and you have to filter them out by
hand.

That choice is worth being deliberate about, because "customers who spent
nothing" is often exactly what a report *should* show. Read the requirement,
then pick the join.

Left to you: whether to group by name or by customer id. Names are not unique in
real data; ids are. The gate's data cannot tell the difference, and a code
reviewer would.
