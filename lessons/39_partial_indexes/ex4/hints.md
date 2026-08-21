## Hint 1
`product_id` is the indexed column; `rating = 5` is the index's
predicate.

## Hint 2
`CREATE INDEX reviews_five_star_product_idx ON reviews (product_id) WHERE rating = 5;`
