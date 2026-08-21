-- 51_query_rewrites/ex4: this is the slow query — rewrite it (README "Exercise 4").
-- The DISTINCT is cleanup for a join that multiplied rows nobody wanted.
SELECT DISTINCT p.id, p.name
FROM products p
JOIN order_items oi ON oi.product_id = p.id
WHERE p.category = 'garden';
