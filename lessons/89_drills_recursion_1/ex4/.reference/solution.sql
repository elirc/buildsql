WITH RECURSIVE org AS (
    SELECT id, name, 1 AS depth, ARRAY[name] AS names
    FROM staff
    WHERE manager_id IS NULL
    UNION ALL
    SELECT s.id, s.name, o.depth + 1, o.names || s.name
    FROM staff s
    JOIN org o ON s.manager_id = o.id
)
SELECT id, name, depth, array_to_string(names, ' > ') AS path
FROM org
ORDER BY id;
