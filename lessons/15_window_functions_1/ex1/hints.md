## Hint 1
One window function over the whole table — no PARTITION BY. Its ORDER BY
(inside OVER) needs the tie-break; the query's own ORDER BY sorts the
output.

## Hint 2
```sql
SELECT name, salary,
       row_number() OVER (ORDER BY salary DESC, id) AS rn
FROM staff
ORDER BY rn;
```
