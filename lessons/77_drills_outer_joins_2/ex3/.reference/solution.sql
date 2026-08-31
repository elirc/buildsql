SELECT c.id, c.name,
       count(o.id) AS orders,
       count(CASE WHEN o.status = 'cancelled' THEN 1 END) AS cancelled,
       coalesce(sum(CASE WHEN o.status <> 'cancelled' THEN o.total END), 0) AS revenue
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'AU'
GROUP BY c.id, c.name
ORDER BY c.id;
