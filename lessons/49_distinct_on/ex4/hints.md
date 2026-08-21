## Hint 1
`ORDER BY product_id, rating DESC, id` - group key first, then the
"best" criterion, then the tie-break.

## Hint 2
`SELECT DISTINCT ON (product_id) product_id, id, rating FROM reviews WHERE product_id <= 20 ORDER BY product_id, rating DESC, id;`
