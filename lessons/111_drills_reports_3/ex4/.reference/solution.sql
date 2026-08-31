WITH davg AS (
  SELECT department, avg(salary) AS dept_avg
  FROM staff
  GROUP BY department)
SELECT s.id, s.name, s.department, s.salary,
       round(d.dept_avg, 2) AS dept_avg,
       round(100.0 * (d.dept_avg - s.salary) / d.dept_avg, 1) AS below_pct
FROM staff s
JOIN davg d USING (department)
WHERE s.salary <= 0.8 * d.dept_avg
ORDER BY (d.dept_avg - s.salary) / d.dept_avg DESC, s.id ASC;
