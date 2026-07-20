## Hint 1
Customers give the country, orders give the money; filter status *and*
the Q3 window, group by country.

## Hint 2
```sql
SELECT c.country, sum(o.total) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
  AND o.created_at >= '2023-07-01' AND o.created_at < '2023-10-01'
GROUP BY c.country;
```
