WITH RECURSIVE chain AS (
    SELECT s.id, s.name, s.department, s.manager_id, 1 AS pos
    FROM staff s
    WHERE s.salary = (SELECT min(salary) FROM staff)
    UNION ALL
    SELECT m.id, m.name, m.department, m.manager_id, c.pos + 1
    FROM chain c
    JOIN staff m ON m.id = c.manager_id
)
SELECT pos, id, name, department
FROM chain
ORDER BY pos;
