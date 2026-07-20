## Hint 1
Two layers: a CTE grouping October's orders into (day, revenue), then a
window `sum(revenue) OVER (ORDER BY day)` on top. The default frame does
the "so far" for you.

## Hint 2
```sql
WITH daily AS (
    SELECT date_trunc('day', created_at) AS day, sum(total) AS revenue
    FROM orders
    WHERE created_at >= '2023-10-01' AND created_at < '2023-11-01'
    GROUP BY 1
)
SELECT day, revenue,
       sum(revenue) OVER (ORDER BY day) AS running
FROM daily
ORDER BY day;
```
