WITH months AS (
  SELECT g::date AS month_start
  FROM generate_series(DATE '2023-01-01', DATE '2023-12-01', interval '1 month') AS g),
depts AS (
  SELECT d.department
  FROM (VALUES ('engineering'), ('sales'), ('support')) AS d(department)),
hires AS (
  SELECT department, date_trunc('month', hired_on)::date AS month_start, count(*) AS hires
  FROM staff
  WHERE hired_on >= DATE '2023-01-01'
    AND hired_on < DATE '2024-01-01'
    AND department IN ('engineering', 'sales', 'support')
  GROUP BY 1, 2)
SELECT d.department, m.month_start, coalesce(h.hires, 0) AS hires
FROM depts d
CROSS JOIN months m
LEFT JOIN hires h ON h.department = d.department
                 AND h.month_start = m.month_start
ORDER BY 1, 2;
