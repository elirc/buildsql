WITH RECURSIVE org AS (
    SELECT id, name, 1 AS depth, name::text AS path
    FROM staff
    WHERE manager_id IS NULL
    UNION ALL
    SELECT s.id, s.name, o.depth + 1, o.path || ' > ' || s.name
    FROM staff s
    JOIN org o ON s.manager_id = o.id
)
SELECT id, name, depth, path
FROM org
ORDER BY id;
