## Hint 1
Same shape as exercise 1, on a different table: the two highest-paid people
*in each department*. The per-group `LIMIT 2` is the tell that you want a
lateral subquery.

## Hint 2
Drive the query from the distinct departments and join each to a lateral
subquery filtered to that department, ordered by salary descending, limited
to two rows.

## Hint 3
```sql
SELECT d.department, t.name, t.salary
FROM (SELECT DISTINCT department FROM staff) d
CROSS JOIN LATERAL (
    SELECT name, salary FROM staff s
    WHERE s.department = d.department
    ORDER BY salary DESC, id
    LIMIT 2
) t;
```
