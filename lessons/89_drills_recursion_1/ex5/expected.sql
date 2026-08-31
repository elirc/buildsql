WITH RECURSIVE org AS (
    SELECT id, department, 1 AS depth
    FROM staff
    WHERE manager_id IS NULL
    UNION ALL
    SELECT s.id, s.department, o.depth + 1
    FROM staff s
    JOIN org o ON s.manager_id = o.id
)
SELECT o.department,
       max(o.depth) AS max_depth,
       count(*) FILTER (
           WHERE NOT EXISTS (SELECT 1 FROM staff r WHERE r.manager_id = o.id)
       ) AS leaves
FROM org o
GROUP BY o.department
ORDER BY o.department;
