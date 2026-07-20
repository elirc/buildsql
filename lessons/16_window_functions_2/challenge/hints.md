## Hint 1
`lag(revenue) OVER (ORDER BY month)` appears twice in the formula
(subtraction and division) — either repeat it, or compute `prev` in a
second CTE layer and do plain arithmetic outside.

## Hint 2
```sql
WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders GROUP BY 1
), with_prev AS (
    SELECT month, revenue,
           lag(revenue) OVER (ORDER BY month) AS prev
    FROM monthly
)
SELECT month, revenue,
       round(100 * (revenue - prev) / prev, 1) AS growth_pct
FROM with_prev
ORDER BY month;
```

Why no divide-by-zero guard? Every month has revenue here — but notice
the first month: NULL/NULL arithmetic just yields NULL, exactly right.
