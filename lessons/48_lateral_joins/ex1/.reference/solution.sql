-- 48_lateral_joins/ex1 reference
SELECT c.category, top3.name, top3.price
FROM (SELECT DISTINCT category FROM products) AS c
CROSS JOIN LATERAL (
    SELECT name, price
    FROM products p
    WHERE p.category = c.category
    ORDER BY price DESC, id
    LIMIT 3
) AS top3;
