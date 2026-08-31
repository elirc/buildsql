WITH weeks AS (
  SELECT g::date AS week_start
  FROM generate_series(DATE '2023-01-02', DATE '2023-12-25', interval '1 week') AS g)
SELECT w.week_start
FROM weeks w
LEFT JOIN staff s
       ON s.hired_on >= w.week_start
      AND s.hired_on < w.week_start + 7
WHERE s.id IS NULL
ORDER BY w.week_start;
