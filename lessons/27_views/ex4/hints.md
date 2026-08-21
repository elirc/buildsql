## Hint 1
`CREATE VIEW active_customers AS SELECT c.id, c.name, c.country FROM
customers c WHERE EXISTS (...)`.

## Hint 2
The EXISTS subquery is correlated on `o.customer_id = c.id` and filters
`o.status IN ('paid','shipped')`.
