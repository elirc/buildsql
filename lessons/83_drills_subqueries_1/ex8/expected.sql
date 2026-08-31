SELECT s.department,
       count(*) AS staff,
       (SELECT t.name FROM staff t
        WHERE t.department = s.department
        ORDER BY t.salary DESC, t.id
        LIMIT 1) AS top_earner
FROM staff s
GROUP BY s.department
HAVING avg(s.salary) > (SELECT avg(salary) FROM staff)
ORDER BY s.department;
