WITH RECURSIVE org AS (
    SELECT id, 1 AS depth
    FROM staff
    WHERE manager_id IS NULL
    UNION ALL
    SELECT s.id, org.depth + 1
    FROM staff s
    JOIN org ON s.manager_id = org.id
)
SELECT depth, count(*) AS staff
FROM org
GROUP BY depth
ORDER BY depth;
