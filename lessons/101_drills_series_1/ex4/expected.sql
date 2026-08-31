WITH hours AS (
  SELECT generate_series(0, 23) AS hour),
by_hour AS (
  SELECT extract(hour FROM created_at)::int AS hour, count(*) AS orders
  FROM orders
  WHERE created_at >= DATE '2023-05-10'
    AND created_at < DATE '2023-05-11'
  GROUP BY 1)
SELECT h.hour, coalesce(b.orders, 0) AS orders
FROM hours h
LEFT JOIN by_hour b ON b.hour = h.hour
ORDER BY h.hour;
