SELECT o.id, o.total
FROM orders o
WHERE o.total > 1995
UNION
SELECT o.id, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.email = 'user4242@example.com';
