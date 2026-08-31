WITH months AS (
  SELECT g::date AS month_start
  FROM generate_series(DATE '2023-01-01', DATE '2023-12-01', interval '1 month') AS g),
depts AS (
  SELECT d.department
  FROM (VALUES ('engineering'), ('sales'), ('support')) AS d(department))
SELECT d.department, m.month_start, count(s.id) AS hires
FROM depts d
CROSS JOIN months m
LEFT JOIN staff s ON s.department = d.department
                 AND s.hired_on >= m.month_start
                 AND s.hired_on < m.month_start + interval '1 month'
GROUP BY d.department, m.month_start
ORDER BY d.department, m.month_start;
