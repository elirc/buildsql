## Hint 1
Two grouping columns from two different tables - the category from `products` and the status from `orders` - with the measures coming from the line in between.

## Hint 2
Join the three tables, filter the window, `GROUP BY p.category, o.status`. The revenue is a sum at line grain and is fine, but the order count is not: an order with three lines in the same category contributes three rows, so `count(DISTINCT o.id)` is what the report means.
