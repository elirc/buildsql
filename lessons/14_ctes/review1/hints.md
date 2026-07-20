## Hint 1
CTE: pending orders (or go straight to the join — but practice the WITH).
Main: join to customers, group by country, sum totals.

## Hint 2
```sql
WITH pending AS (SELECT * FROM orders WHERE status = 'pending')
SELECT c.country, sum(p.total) AS revenue
FROM pending p JOIN customers c ON c.id = p.customer_id
GROUP BY c.country;
```
