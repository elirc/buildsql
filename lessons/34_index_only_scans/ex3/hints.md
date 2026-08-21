## Hint 1
Both columns the query mentions must live in the index: the searched
one first, the output one after it.

## Hint 2
`CREATE INDEX reviews_product_rating_cover_idx ON reviews (product_id, rating);`
