WITH scored AS (
  SELECT id, name, department, salary,
         avg(salary) OVER (PARTITION BY department) AS dept_avg
  FROM staff)
SELECT id, name, department, salary,
       round(dept_avg, 2) AS dept_avg,
       round(100.0 * (dept_avg - salary) / dept_avg, 1) AS below_pct
FROM scored
WHERE salary <= 0.8 * dept_avg
ORDER BY (dept_avg - salary) / dept_avg DESC, id ASC;
