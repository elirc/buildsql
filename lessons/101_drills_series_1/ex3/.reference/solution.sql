WITH calendar AS (
  SELECT g::date AS day
  FROM generate_series(DATE '2023-03-01', DATE '2023-03-31', interval '1 day') AS g),
daily AS (
  SELECT created_at::date AS day, count(*) AS orders
  FROM orders
  WHERE created_at >= DATE '2023-03-01'
    AND created_at < DATE '2023-04-01'
  GROUP BY 1)
SELECT c.day, coalesce(d.orders, 0) AS orders
FROM calendar c
LEFT JOIN daily d ON d.day = c.day
ORDER BY c.day;
