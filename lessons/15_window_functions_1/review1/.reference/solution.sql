WITH numbered AS (
    SELECT id, name, price,
           row_number() OVER (ORDER BY price DESC, id) AS rn
    FROM products
)
SELECT id, name, price
FROM numbered
WHERE rn BETWEEN 11 AND 20
ORDER BY price DESC, id;
