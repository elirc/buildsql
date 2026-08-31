SELECT department, count(*) AS headcount, count(manager_id) AS with_manager
FROM staff
GROUP BY department
ORDER BY department;
