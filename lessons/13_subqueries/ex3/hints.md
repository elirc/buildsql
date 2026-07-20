## Hint 1
Filter the country in the outer WHERE; the NOT EXISTS clause holds a
one-line query correlated on the customer id.

## Hint 2
```sql
SELECT c.id, c.name
FROM customers c
WHERE c.country = 'ES'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```
