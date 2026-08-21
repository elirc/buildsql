WITH last_seen AS (
    SELECT category, id
    FROM products
    ORDER BY category, id
    OFFSET 19
    LIMIT 1
)
SELECT p.id, p.category, p.name
FROM products p, last_seen c
WHERE (p.category, p.id) > (c.category, c.id)
ORDER BY p.category, p.id
LIMIT 20;
