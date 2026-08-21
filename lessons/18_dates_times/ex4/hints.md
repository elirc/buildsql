## Hint 1
Same shape as any per-period report: filter with a half-open range,
group by the truncated timestamp, order by it.

## Hint 2
`SELECT date_trunc('week', created_at) AS week, count(*), sum(total) FROM orders WHERE created_at >= '2023-10-01' AND created_at < '2023-11-01' GROUP BY 1 ORDER BY 1;`
