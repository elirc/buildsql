## Hint 1
The query filters on exactly one column of `orders`. That column is the
one to index. `dojo plan 31_first_index ex1` shows you the before/after.

## Hint 2
`CREATE INDEX orders_customer_id_idx ON orders (customer_id);`
