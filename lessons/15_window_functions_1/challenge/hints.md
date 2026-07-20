## Hint 1
Identical skeleton to ex3 with three changes: table, partition column,
and `rank()` instead of `row_number()` — reread the concept section for
why that changes tie behavior.

## Hint 2
```sql
WITH ranked AS (
    SELECT department, name, salary,
           rank() OVER (PARTITION BY department ORDER BY salary DESC) AS r
    FROM staff
)
SELECT department, name, salary FROM ranked WHERE r <= 3;
```
