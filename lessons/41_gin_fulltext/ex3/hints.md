## Hint 1
Exactly the index from exercise 1 - the index is over the left-hand
side of `@@`, and that has not changed.

## Hint 2
`CREATE INDEX reviews_body_fts_idx ON reviews USING gin (to_tsvector('english', body));`
