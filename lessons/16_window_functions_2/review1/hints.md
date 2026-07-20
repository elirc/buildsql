## Hint 1
One `ntile(4)` window ordered by (salary DESC, id); the outer ORDER BY
repeats that key so the buckets read top-down.

## Hint 2
```sql
SELECT name, salary,
       ntile(4) OVER (ORDER BY salary DESC, id) AS quartile
FROM staff
ORDER BY salary DESC, id;
```
