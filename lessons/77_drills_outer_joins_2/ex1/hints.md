## Hint 1
Every Australian customer has to appear, including the ones with no cancelled orders and the ones with no orders at all. So `cancelled` is a restriction on what counts as a match, not a restriction on which customers you want.

## Hint 2
`LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'cancelled'`. Put that status test in `WHERE` instead and every customer who should have scored 0 disappears, because the NULL-extended row fails it.
