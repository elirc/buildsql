## Hint 1

`Join` takes four arguments in a fixed order: the inner sequence, the outer key
selector, the inner key selector, and a result selector that receives both
matched items.

Which sequence you call it *on* matters. The output keeps that sequence's order
and is driven by its rows - and the summary says the rows come out in order of
the orders.

## Hint 2

```csharp
orders.Join(
    customers,
    order => order.CustomerId,
    customer => customer.Id,
    (order, customer) => $"{customer.Name}:{order.Product}");
```

The two key selectors must return the same type; that is the only part of this
the compiler can check for you.

For `ProductsFor`, the tidiest route is to narrow the customers to the named
one before joining, so the join itself does the filtering. Note what the gate
checks at the end: an inner join gives the same empty answer for "this customer
ordered nothing" and "this customer does not exist", which is exactly the
ambiguity ex2 removes.
