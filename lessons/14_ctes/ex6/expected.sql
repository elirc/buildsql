WITH RECURSIVE subtree AS (
    SELECT id, name, 1 AS depth
    FROM staff
    WHERE id = 2
    UNION ALL
    SELECT s.id, s.name, subtree.depth + 1
    FROM staff s
    JOIN subtree ON s.manager_id = subtree.id
)
SELECT id, name, depth FROM subtree;
