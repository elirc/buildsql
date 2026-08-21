## Hint 1
`DELETE FROM reviews r USING products p WHERE p.id = r.product_id AND ...`
The conditions on the product go alongside the join key.

## Hint 2
`DELETE FROM reviews r USING products p WHERE p.id = r.product_id AND p.category = 'garden' AND p.id < 100 AND r.rating = 1;`
