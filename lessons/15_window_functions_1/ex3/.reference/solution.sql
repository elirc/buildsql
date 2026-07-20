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
