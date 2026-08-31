WITH RECURSIVE heads AS (
    SELECT s.id, s.name, s.salary, s.name AS head_name, s.salary AS head_salary
    FROM staff s
    WHERE s.manager_id = (SELECT id FROM staff WHERE manager_id IS NULL)
    UNION ALL
    SELECT s.id, s.name, s.salary, h.head_name, h.head_salary
    FROM staff s
    JOIN heads h ON s.manager_id = h.id
)
SELECT id, name, head_name, round(salary / head_salary, 3) AS salary_ratio
FROM heads
ORDER BY id;
