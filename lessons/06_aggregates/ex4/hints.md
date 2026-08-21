## Hint 1
`DISTINCT` goes *inside* the parentheses, before the column name:
`count(DISTINCT customer_id)`.

## Hint 2
`SELECT count(*), count(DISTINCT customer_id), count(DISTINCT status) FROM orders;`
