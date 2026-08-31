SELECT c.id, c.name,
       count(o.id) AS orders,
       count(o.id) FILTER (WHERE o.status = 'cancelled') AS cancelled,
       coalesce(sum(o.total) FILTER (WHERE o.status <> 'cancelled'), 0) AS revenue
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'AU'
GROUP BY c.id, c.name
ORDER BY c.id;
