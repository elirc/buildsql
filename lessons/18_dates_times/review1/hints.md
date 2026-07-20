## Hint 1
Join orders to customers, apply the two-sided interval condition from the
prompt, count. The prompt literally contains the WHERE clause.

## Hint 2
```sql
SELECT count(*) AS first_week_orders
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.created_at >= c.created_at
  AND o.created_at < c.created_at + interval '7 days';
```
