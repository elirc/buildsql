## Hint 1
Four statements: ADD COLUMN (nullable), UPDATE all to 'member', UPDATE
the 250 heavy customers to 'vip' (lesson 07 ex2's HAVING query inside an
IN), SET NOT NULL.

## Hint 2
```sql
ALTER TABLE customers ADD COLUMN loyalty_tier text;

UPDATE customers SET loyalty_tier = 'member';

UPDATE customers SET loyalty_tier = 'vip'
WHERE id IN (SELECT customer_id FROM orders
             GROUP BY customer_id HAVING count(*) > 20);

ALTER TABLE customers ALTER COLUMN loyalty_tier SET NOT NULL;
```
