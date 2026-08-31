WITH ranked AS (
    SELECT category, id, name, price,
           rank() OVER (PARTITION BY category ORDER BY price DESC, id) AS rn
    FROM products
)
SELECT category, id, name, price
FROM ranked
WHERE rn = 3
ORDER BY category;
