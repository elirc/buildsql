## Hint 1
Two one-column queries stacked with the deduplicating operator. Side one
reads `orders`, side two reads `customers` — the column names differ and
that's fine.

## Hint 2
```sql
SELECT customer_id FROM orders WHERE total > 1990
UNION
SELECT id FROM customers WHERE country = 'BR';
```
