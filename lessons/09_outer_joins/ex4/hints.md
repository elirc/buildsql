## Hint 1
The ON clause can hold more than the join key: `ON r.product_id = p.id
AND r.rating = 5`. The category filter stays in WHERE.

## Hint 2
`LEFT JOIN reviews r ON r.product_id = p.id AND r.rating = 5` ... `WHERE p.category = 'garden'` ... `count(r.id)`
