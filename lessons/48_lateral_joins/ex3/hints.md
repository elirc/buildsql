## Hint 1
`CROSS JOIN LATERAL (SELECT ... WHERE o.customer_id = c.id ORDER BY ...
LIMIT 2) AS recent` - the subquery may reference `c` because of LATERAL.

## Hint 2
Order by `created_at DESC, id DESC` inside the subquery so the two rows
are deterministic, then `LIMIT 2`.
