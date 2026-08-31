WITH t AS (
    SELECT avg(price) AS avg_price FROM products WHERE category = 'toys'
)
SELECT p.id, p.name, p.price
FROM products p, t
WHERE p.category = 'toys' AND p.price > t.avg_price
ORDER BY p.id;
