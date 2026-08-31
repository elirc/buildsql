WITH RECURSIVE up AS (
    SELECT id AS start_id, manager_id, 1 AS depth
    FROM staff
    UNION ALL
    SELECT u.start_id, s.manager_id, u.depth + 1
    FROM staff s
    JOIN up u ON s.id = u.manager_id
)
SELECT depth, count(*) AS staff
FROM up
WHERE manager_id IS NULL
GROUP BY depth
ORDER BY depth;
