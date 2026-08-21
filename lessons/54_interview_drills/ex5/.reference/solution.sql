WITH hired AS (
  SELECT date_trunc('month', hired_on)::date AS month, count(*) AS hires
  FROM staff
  WHERE department = 'sales'
    AND hired_on >= DATE '2019-01-01'
    AND hired_on < DATE '2020-01-01'
  GROUP BY 1)
SELECT cal.month::date AS month, coalesce(h.hires, 0) AS hires
FROM generate_series(DATE '2019-01-01', DATE '2019-12-01',
                     INTERVAL '1 month') AS cal(month)
LEFT JOIN hired h ON h.month = cal.month::date
ORDER BY 1;
