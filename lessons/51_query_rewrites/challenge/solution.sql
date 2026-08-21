-- 51_query_rewrites/challenge: three sins, one query — rewrite it
-- (README "Challenge"). Same rows, at least 5x faster.
SELECT DISTINCT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE date_trunc('day', o.created_at) = TIMESTAMPTZ '2023-06-15 00:00:00+00'
   OR c.email = 'user4242@example.com';
