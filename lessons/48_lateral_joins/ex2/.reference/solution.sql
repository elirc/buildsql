-- 48_lateral_joins/ex2 reference
SELECT d.department, top2.name, top2.salary
FROM (SELECT DISTINCT department FROM staff) AS d
CROSS JOIN LATERAL (
    SELECT name, salary
    FROM staff s
    WHERE s.department = d.department
    ORDER BY salary DESC, id
    LIMIT 2
) AS top2;
