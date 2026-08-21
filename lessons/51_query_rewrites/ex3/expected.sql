SELECT o.id, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.total > 1995
   OR c.email = 'user4242@example.com';
