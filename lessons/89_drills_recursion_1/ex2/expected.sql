WITH RECURSIVE chain AS (
    SELECT id, name, department, manager_id, 1 AS pos
    FROM staff
    WHERE id = (SELECT id FROM staff ORDER BY salary, id LIMIT 1)
    UNION ALL
    SELECT s.id, s.name, s.department, s.manager_id, c.pos + 1
    FROM staff s
    JOIN chain c ON s.id = c.manager_id
)
SELECT pos, id, name, department
FROM chain
ORDER BY pos;
