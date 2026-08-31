## Hint 1
No aggregation this time - you are looking at the raw shape a LEFT JOIN produces. One row per matching order, and for a customer with no orders at all, exactly one row with the right-hand columns filled in with NULL.

## Hint 2
`FROM customers c LEFT JOIN orders o ON o.customer_id = c.id` with both customer predicates in `WHERE`. The ordering asks for the NULL-extended row first within each customer, which is what `ORDER BY c.id, o.id NULLS FIRST` gives you - Postgres sorts NULLs last by default for ascending order.
