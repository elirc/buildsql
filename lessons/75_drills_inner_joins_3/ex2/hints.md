## Hint 1
You are starting from a slice of `products` and walking outwards: product -> the lines that sold it -> the order each line belongs to.

## Hint 2
`FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN orders o ON o.id = oi.order_id`, with both product predicates in `WHERE`. Note that `oi.id` and `o.id` are different things - alias every table and prefix every column.
