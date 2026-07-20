## Hint 1
CTE: select category, name, price, id and `row_number() OVER (PARTITION
BY category ORDER BY price DESC, id)`. Outside: `WHERE rn <= 5`, then the
required ORDER BY. (Why can't the WHERE live inside? Windows evaluate
after WHERE.)

## Hint 2
```sql
WITH ranked AS (
    SELECT category, name, price, id,
           row_number() OVER (PARTITION BY category
                              ORDER BY price DESC, id) AS rn
    FROM products
)
SELECT category, name, price
FROM ranked
WHERE rn <= 5
ORDER BY category, price DESC, id;
```
