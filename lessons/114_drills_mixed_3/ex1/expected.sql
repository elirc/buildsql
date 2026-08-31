WITH d AS (
  SELECT department, sum(salary) AS payroll
  FROM staff
  GROUP BY department)
SELECT department, payroll,
       round(100.0 * payroll / sum(payroll) OVER (), 1) AS payroll_pct
FROM d
ORDER BY department;
