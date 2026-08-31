WITH RECURSIVE heads AS (
    SELECT id AS head_id, id
    FROM staff
    WHERE manager_id = (SELECT id FROM staff WHERE manager_id IS NULL)
    UNION ALL
    SELECT h.head_id, s.id
    FROM staff s
    JOIN heads h ON s.manager_id = h.id
)
SELECT s.id, s.name, d.name AS head_name,
       round(s.salary / d.salary, 3) AS salary_ratio
FROM heads h
JOIN staff s ON s.id = h.id
JOIN staff d ON d.id = h.head_id
ORDER BY s.id;
