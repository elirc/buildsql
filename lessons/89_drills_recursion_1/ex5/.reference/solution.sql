WITH RECURSIVE up AS (
    SELECT id AS start_id, department, manager_id, 1 AS depth
    FROM staff
    UNION ALL
    SELECT u.start_id, u.department, s.manager_id, u.depth + 1
    FROM staff s
    JOIN up u ON s.id = u.manager_id
), depths AS (
    SELECT start_id AS id, department, depth
    FROM up
    WHERE manager_id IS NULL
)
SELECT d.department,
       max(d.depth) AS max_depth,
       count(*) FILTER (WHERE r.id IS NULL) AS leaves
FROM depths d
LEFT JOIN (SELECT DISTINCT manager_id AS id FROM staff
           WHERE manager_id IS NOT NULL) r ON r.id = d.id
GROUP BY d.department
ORDER BY d.department;
