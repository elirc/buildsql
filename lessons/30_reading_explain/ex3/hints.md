## Hint 1
The `Sort Method:` line appears under the Sort node in EXPLAIN ANALYZE
output (it needs ANALYZE - a plain EXPLAIN does not print it).

## Hint 2
It is the algorithm PostgreSQL uses when it only needs the best N rows:
`SELECT 'top-N heapsort';`
