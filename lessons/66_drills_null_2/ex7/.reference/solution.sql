SELECT department,
       count(*) AS headcount,
       count(*) FILTER (WHERE manager_id IS NULL) AS rootless
FROM staff
GROUP BY department
HAVING count(*) FILTER (WHERE manager_id IS NULL) > 0
ORDER BY department;
