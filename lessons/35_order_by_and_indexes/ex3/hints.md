## Hint 1
Equality column first, sort column second. The sort column's direction
can go in the index too.

## Hint 2
`CREATE INDEX reviews_product_created_idx ON reviews (product_id, created_at DESC);`
