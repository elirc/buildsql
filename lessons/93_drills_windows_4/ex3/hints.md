## Hint 1

The join to `products` only adds a name. The window works on the rows the join produced, exactly as it would on a single table.

## Hint 2

`sum(oi.quantity * oi.price) OVER (PARTITION BY oi.order_id)` gives the order's total on every one of its lines, and dividing the line by it gives the share.

## Hint 3

An order can hold the same product twice, so order the output by `oi.order_id, oi.id` - `product_id` is not a unique key within an order.
