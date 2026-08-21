-- 51_query_rewrites/ex1: this is the slow query — rewrite it (README "Exercise 1").
-- The index on orders (created_at) already exists; make the WHERE able to use it.
SELECT count(*) AS orders, sum(total) AS revenue
FROM orders
WHERE date_trunc('day', created_at) = TIMESTAMPTZ '2023-06-15 00:00:00+00';
