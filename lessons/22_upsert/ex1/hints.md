## Hint 1
Two VALUES tuples, conflict target `(product_id)`, and an overwrite-style
DO UPDATE using EXCLUDED. Overwrite (not add) is what makes running it
twice safe.

## Hint 2
```sql
INSERT INTO inventory (product_id, stock)
VALUES (50, 75), (150, 40)
ON CONFLICT (product_id)
DO UPDATE SET stock = EXCLUDED.stock;
```
