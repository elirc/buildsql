## Hint 1
Two `CREATE INDEX` statements, one column each. What the planner then does
with them is the exercise - read the plan afterwards and notice which one
it actually used.

## Hint 2
`CREATE INDEX order_items_product_only_idx ON order_items (product_id);`
and `CREATE INDEX order_items_quantity_only_idx ON order_items (quantity);`
