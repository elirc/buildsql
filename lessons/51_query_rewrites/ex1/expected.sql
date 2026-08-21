SELECT count(*) AS orders, sum(total) AS revenue
FROM orders
WHERE date_trunc('day', created_at) = TIMESTAMPTZ '2023-06-15 00:00:00+00';
