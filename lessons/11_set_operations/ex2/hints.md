## Hint 1
First list: US customer ids. Second list: every customer_id in orders.
One operator subtracts the second from the first.

## Hint 2
```sql
SELECT id FROM customers WHERE country = 'US'
EXCEPT
SELECT customer_id FROM orders;
```
