SELECT c.category, t.name, t.price
FROM (SELECT DISTINCT category FROM products) c
CROSS JOIN LATERAL (
    SELECT name, price
    FROM products p
    WHERE p.category = c.category
    ORDER BY price DESC, id
    LIMIT 3
) t;
