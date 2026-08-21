-- 48_lateral_joins/challenge reference
SELECT c.category, round(t.avg_top5, 2) AS avg_top5
FROM (SELECT DISTINCT category FROM products) AS c
CROSS JOIN LATERAL (
    SELECT avg(price) AS avg_top5
    FROM (
        SELECT price
        FROM products p
        WHERE p.category = c.category
        ORDER BY price DESC, id
        LIMIT 5
    ) AS top5
) AS t;
