## Hint 1
The filter is on `reviews.product_id`. Index that, and the driving side
drops from a million rows to about a hundred.

## Hint 2
`CREATE INDEX reviews_product_join_idx ON reviews (product_id);`
