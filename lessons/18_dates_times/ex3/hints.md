## Hint 1
`extract(month FROM created_at)` returns numeric; cast it with `::int`.
Group and order by the same expression (or by `1`).

## Hint 2
`SELECT extract(month FROM created_at)::int AS month_no, count(*) AS orders FROM orders GROUP BY 1 ORDER BY 1;`
