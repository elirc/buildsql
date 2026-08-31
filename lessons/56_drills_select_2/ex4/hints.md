## Hint 1
The question is about the set of products referenced by order lines, not
about the order lines themselves.

## Hint 2
One column, one `DISTINCT`, one table. Do not join to `products`: the
prompt asks only which ids occur in `order_items`, and joining would change
nothing except the cost.
