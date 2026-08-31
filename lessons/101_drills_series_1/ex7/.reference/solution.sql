WITH calendar AS (
  SELECT g::date AS day
  FROM generate_series(DATE '2023-02-01', DATE '2023-02-28', interval '1 day') AS g),
counted AS (
  SELECT created_at::date AS day, count(*) AS orders
  FROM orders
  WHERE created_at >= DATE '2023-02-01'
    AND created_at < DATE '2023-03-01'
  GROUP BY 1),
daily AS (
  SELECT c.day, coalesce(n.orders, 0) AS orders
  FROM calendar c
  LEFT JOIN counted n ON n.day = c.day)
SELECT day, orders,
       sum(orders) OVER (ORDER BY day) AS running_orders
FROM daily
ORDER BY day;
