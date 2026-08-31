## Hint 1

`GroupJoin` has the same four arguments as `Join`, but the result selector
receives the outer item and a **sequence** of its matches - which may be empty.
That empty group is the whole point: every outer item gets a row.

Start from the customers, not the orders.

## Hint 2

```csharp
customers.GroupJoin(
    orders,
    customer => customer.Id,
    order => order.CustomerId,
    (customer, theirOrders) => new { customer.Name, Orders = theirOrders });
```

`CustomerBasket` and `Idle` then just ask the group a question - `Count`,
`Any` - and format the answer.

## Hint 3

`EveryRow` is the flattened left join, and it needs one more operator:

```csharp
.SelectMany(row => row.Orders.DefaultIfEmpty(), (row, order) => ...)
```

`DefaultIfEmpty` turns an empty sequence into a sequence of exactly one
`default` value - `null` for a reference type - so a customer with no orders
still contributes one row instead of none. Leave it out and you have quietly
written an inner join again.

The null then has to be handled in the result selector. Decide for yourself
whether `order?.Product ?? "-"` or a pattern reads better; the gate only cares
about the text.
