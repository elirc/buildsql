## Hint 1
Lesson 07 ex2 built the aggregation. Wrap it in `WITH <name> AS (...)`,
then write a plain join between `customers` and the name.

## Hint 2
```sql
WITH heavy AS (
    SELECT customer_id, count(*) AS n
    FROM orders GROUP BY customer_id HAVING count(*) > 20
)
SELECT c.id, c.name, heavy.n
FROM heavy JOIN customers c ON c.id = heavy.customer_id;
```
