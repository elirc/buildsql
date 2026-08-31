## Hint 1
The thing that must not exist is described by two tables at once: a line with quantity 5 **and** an order created in the window. Both conditions belong inside the absence, not outside it.

## Hint 2
`NOT EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON ... WHERE oi.product_id = p.id AND ...)`. If you prefer the outer-join spelling, build the set of disqualified product ids as a subquery first, `LEFT JOIN` it, and keep the rows where it came back NULL.
