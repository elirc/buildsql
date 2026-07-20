## Hint 1
Correlate on department: the inner avg is computed over staff rows whose
department equals the outer row's.

## Hint 2
```sql
SELECT s.id, s.name
FROM staff s
WHERE s.salary > (SELECT avg(s2.salary)
                  FROM staff s2
                  WHERE s2.department = s.department);
```
