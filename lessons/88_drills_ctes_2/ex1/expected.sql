WITH category_avg AS (
    SELECT category, avg(price) AS avg_price
    FROM products
    GROUP BY category
)
SELECT p.id, p.name, p.category, p.price
FROM products p
JOIN category_avg a ON a.category = p.category
WHERE p.category IN ('books', 'electronics')
  AND p.price > a.avg_price
ORDER BY p.category, p.id;
