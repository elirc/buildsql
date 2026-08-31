## Hint 1

Two jobs, one per step: the CTE decides *which* orders count, the outer query decides *what to report* about them.

## Hint 2

`WITH recent AS (SELECT status, total FROM orders WHERE created_at >= '2023-10-01') SELECT ... FROM recent GROUP BY status ORDER BY status`.
