SELECT o.customer_id,
       c.name,
       sum(o.total) AS revenue,
       max(o.created_at) AS last_order_at
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status <> 'cancelled'
GROUP BY o.customer_id, c.name
HAVING max(o.created_at) < '2023-09-01'
ORDER BY revenue DESC, customer_id ASC
LIMIT 10;
