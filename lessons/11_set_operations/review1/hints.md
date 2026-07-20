## Hint 1
Each half is a two-column SELECT whose first column is a quoted literal
(`'gift'` / `'snack'`). Stack with UNION ALL — duplicates are impossible
here anyway, so skip the dedup cost.

## Hint 2
```sql
SELECT 'gift' AS label, name FROM products
WHERE category = 'toys' AND price < 20
UNION ALL
SELECT 'snack', name FROM products
WHERE category = 'food' AND price < 10;
```
