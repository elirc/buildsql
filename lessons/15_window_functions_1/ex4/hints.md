## Hint 1
Two window functions sharing the same `OVER (ORDER BY salary DESC)`.
The outer `ORDER BY` is separate and needs the `id` tie-break.

## Hint 2
`SELECT name, salary, rank() OVER (ORDER BY salary DESC) AS rnk, dense_rank() OVER (ORDER BY salary DESC) AS drnk FROM staff ORDER BY salary DESC, id;`
