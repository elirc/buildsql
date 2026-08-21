## Hint 1
One column, the one in the ORDER BY. The direction is optional -
PostgreSQL can scan a B-tree backwards.

## Hint 2
`CREATE INDEX reviews_created_at_idx ON reviews (created_at);`
