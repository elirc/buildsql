## Hint 1
The scope is lesson 09's "never ordered" anti-join restricted to garden.
Rehearse it as a SELECT first: ~50 rows. Then convert to UPDATE ... SET
price = round(price * 0.9, 2) WHERE <same conditions>.

## Hint 2
```sql
UPDATE products
SET price = round(price * 0.9, 2)
WHERE category = 'garden'
  AND NOT EXISTS (SELECT 1 FROM order_items oi
                  WHERE oi.product_id = products.id);
```
