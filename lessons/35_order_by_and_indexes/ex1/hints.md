## Hint 1
Equality on `customer_id`, then sort by `created_at`. The index order
follows: equality column, then sort column. DESC in the DDL is optional
here (single sort direction - backward walk covers it).

## Hint 2
`CREATE INDEX orders_customer_created_idx ON orders (customer_id, created_at);`
