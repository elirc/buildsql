## Hint 1
Group by the customer, count each group, then keep only groups over 20.
Row-filtering (WHERE) can't do the last step — group filtering can.

## Hint 2
```sql
SELECT customer_id, count(*)
FROM orders
GROUP BY customer_id
HAVING <the group condition>;
```
