SELECT c.country, o.status, count(*) AS orders
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.country IN ('FR', 'CA')
GROUP BY GROUPING SETS ((c.country), (o.status))
ORDER BY c.country, o.status;
