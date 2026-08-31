SELECT department,
       count(*) AS headcount,
       count(*) FILTER (WHERE manager_id IS NOT NULL) AS with_manager
FROM staff
GROUP BY department
ORDER BY department;
