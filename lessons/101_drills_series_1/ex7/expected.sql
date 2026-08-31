WITH calendar AS (
  SELECT g::date AS day
  FROM generate_series(DATE '2023-02-01', DATE '2023-02-28', interval '1 day') AS g),
daily AS (
  SELECT c.day, count(o.id) AS orders
  FROM calendar c
  LEFT JOIN orders o ON o.created_at::date = c.day
  GROUP BY c.day)
SELECT day, orders,
       sum(orders) OVER (ORDER BY day
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_orders
FROM daily
ORDER BY day;
