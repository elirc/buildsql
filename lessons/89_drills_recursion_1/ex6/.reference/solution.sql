WITH RECURSIVE up AS (
    SELECT id AS descendant, manager_id AS ancestor
    FROM staff
    WHERE manager_id IS NOT NULL
    UNION ALL
    SELECT u.descendant, s.manager_id
    FROM up u
    JOIN staff s ON s.id = u.ancestor
    WHERE s.manager_id IS NOT NULL
)
SELECT s.id, s.name, count(*) AS descendants
FROM up u
JOIN staff s ON s.id = u.ancestor
GROUP BY s.id, s.name
ORDER BY descendants DESC, s.id;
