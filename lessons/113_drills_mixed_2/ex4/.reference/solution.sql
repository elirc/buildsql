WITH managers AS (
  SELECT DISTINCT manager_id AS id
  FROM staff
  WHERE manager_id IS NOT NULL)
SELECT s.department,
       round(avg(s.salary) FILTER (WHERE s.id IN (SELECT id FROM managers)), 2) AS mgr_avg,
       round(avg(s.salary) FILTER (WHERE s.id NOT IN (SELECT id FROM managers)), 2) AS ic_avg
FROM staff s
GROUP BY s.department
ORDER BY s.department;
