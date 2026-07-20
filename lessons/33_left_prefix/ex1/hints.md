## Hint 1
The WHERE names one column; index it. This is deliberately the same
move as lesson 31 - the news is *why it wasn't already there* (FKs
don't auto-index).

## Hint 2
`CREATE INDEX order_items_order_id_idx ON order_items (order_id);`
