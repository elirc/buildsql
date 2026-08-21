## Hint 1
`WITH a AS (...), b AS (...) SELECT ... FROM a JOIN b ON ...` - the
comma separates CTEs, and only the final SELECT is the query.

## Hint 2
First CTE: `SELECT country, count(*) FROM customers GROUP BY country`.
Second: join orders to customers and `GROUP BY c.country`. Then join the
two on `country`.
