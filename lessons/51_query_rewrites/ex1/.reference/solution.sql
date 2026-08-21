SELECT count(*) AS orders, sum(total) AS revenue
FROM orders
WHERE created_at >= TIMESTAMPTZ '2023-06-15 00:00:00+00'
  AND created_at <  TIMESTAMPTZ '2023-06-16 00:00:00+00';
