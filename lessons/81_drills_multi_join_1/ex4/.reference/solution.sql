SELECT c.country,
       count(DISTINCT c.id) AS buyers,
       count(o.id) AS orders,
       coalesce(sum(CASE WHEN o.status <> 'cancelled' THEN o.total END), 0) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.country
ORDER BY 4 DESC, 1;
