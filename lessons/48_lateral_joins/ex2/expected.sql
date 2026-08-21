SELECT d.department, t.name, t.salary
FROM (SELECT DISTINCT department FROM staff) d
CROSS JOIN LATERAL (
    SELECT name, salary
    FROM staff s
    WHERE s.department = d.department
    ORDER BY salary DESC, id
    LIMIT 2
) t;
