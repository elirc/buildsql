## Hint 1
Number every product by (price DESC, id), keep 11–20, order by the same
key. `WHERE rn BETWEEN 11 AND 20` reads nicely.

## Hint 2
```sql
WITH numbered AS (
    SELECT id, name, price,
           row_number() OVER (ORDER BY price DESC, id) AS rn
    FROM products
)
SELECT id, name, price FROM numbered
WHERE rn BETWEEN 11 AND 20
ORDER BY price DESC, id;
```
