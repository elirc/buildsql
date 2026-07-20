## Hint 1
Write segment A and segment B as standalone queries first (A needs
DISTINCT or just relies on EXCEPT/UNION dedup). Then: (A EXCEPT B) UNION
(B EXCEPT A), with parentheses around each half.

## Hint 2
```sql
(SELECT customer_id FROM orders WHERE total > 1980
 EXCEPT
 SELECT id FROM customers WHERE country = 'AU')
UNION
(SELECT id FROM customers WHERE country = 'AU'
 EXCEPT
 SELECT customer_id FROM orders WHERE total > 1980);
```

Trace one customer who is in both segments and confirm they fall out.
