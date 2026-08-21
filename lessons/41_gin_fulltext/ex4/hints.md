## Hint 1
The same index once more. Only the query-builder function changed, and
that is on the right-hand side of `@@`.

## Hint 2
`CREATE INDEX reviews_body_fts_idx ON reviews USING gin (to_tsvector('english', body));`
