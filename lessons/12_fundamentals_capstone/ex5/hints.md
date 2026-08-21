## Hint 1
Group by the same `date_trunc(...)` expression you select. PostgreSQL
also accepts `GROUP BY 1` (the first SELECT-list item) and
`GROUP BY month` (the output alias).

## Hint 2
`SELECT date_trunc('month', created_at) AS month, count(*), sum(total) FROM orders WHERE status = 'paid' AND created_at >= '2023-01-01' AND created_at < '2024-01-01' GROUP BY 1 ORDER BY 1;`
