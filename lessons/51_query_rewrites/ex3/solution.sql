-- 51_query_rewrites/ex3: this is the slow query — rewrite it (README "Exercise 3").
-- The OR straddles the join; no index can serve it as written.
SELECT o.id, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.total > 1995
   OR c.email = 'user4242@example.com';
