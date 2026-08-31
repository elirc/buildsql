SELECT c.country, count(*) AS orders, sum(o.total) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status <> 'cancelled'
  AND o.created_at >= '2023-10-01'
GROUP BY c.country
ORDER BY revenue DESC, country ASC
LIMIT 8;
