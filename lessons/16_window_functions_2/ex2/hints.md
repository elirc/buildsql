## Hint 1
CTE: the 13-row monthly series (lesson 07's challenge). Then `lag(revenue)
OVER (ORDER BY month)` gives `prev`; `revenue - lag(...)` gives `delta` —
NULL propagates through the subtraction on row one, which is what the
prompt wants.

## Hint 2
```sql
WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
    FROM orders GROUP BY 1
)
SELECT month, revenue,
       lag(revenue) OVER (ORDER BY month)           AS prev,
       revenue - lag(revenue) OVER (ORDER BY month) AS delta
FROM monthly
ORDER BY month;
```
