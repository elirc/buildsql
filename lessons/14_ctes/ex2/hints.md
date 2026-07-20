## Hint 1
CTE: lesson 08 ex3's category revenue. Main query: `WHERE revenue >
(scalar subquery averaging the CTE)`. The CTE gets read twice — that's
allowed and normal.

## Hint 2
```sql
WITH cat_rev AS (
    SELECT p.category, sum(oi.quantity * oi.price) AS revenue
    FROM order_items oi JOIN products p ON p.id = oi.product_id
    GROUP BY p.category
)
SELECT category, revenue
FROM cat_rev
WHERE revenue > (SELECT avg(revenue) FROM cat_rev);
```
