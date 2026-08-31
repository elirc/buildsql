SELECT m.id, m.name, m.department,
       count(*) AS reports,
       round(avg(e.salary), 2) AS avg_report_salary
FROM staff m
JOIN staff e ON e.manager_id = m.id
GROUP BY m.id, m.name, m.department
HAVING count(*) >= 5
ORDER BY count(*) DESC, m.id;
