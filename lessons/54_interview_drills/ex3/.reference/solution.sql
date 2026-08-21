SELECT DISTINCT ON (o.customer_id)
       o.customer_id, o.id, o.created_at, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.country = 'JP'
ORDER BY o.customer_id, o.created_at DESC, o.id DESC;
