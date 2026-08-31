WITH bar AS (
    SELECT avg(price) * 1.9 AS cutoff
    FROM products
)
SELECT p.id, p.name, p.price
FROM products p
CROSS JOIN bar
WHERE p.price > bar.cutoff
ORDER BY p.id;
