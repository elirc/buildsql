## Hint 1
Group by the extracted day-of-week. Cast to int (`::int`) so the output
column is a clean integer, and order by it.

## Hint 2
```sql
SELECT extract(dow FROM created_at)::int AS dow, count(*) AS orders
FROM orders
GROUP BY 1
ORDER BY dow;
```
