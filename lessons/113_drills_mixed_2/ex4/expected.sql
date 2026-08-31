SELECT s.department,
       round(avg(s.salary) FILTER (WHERE EXISTS (
         SELECT 1 FROM staff r WHERE r.manager_id = s.id)), 2) AS mgr_avg,
       round(avg(s.salary) FILTER (WHERE NOT EXISTS (
         SELECT 1 FROM staff r WHERE r.manager_id = s.id)), 2) AS ic_avg
FROM staff s
GROUP BY s.department
ORDER BY s.department;
