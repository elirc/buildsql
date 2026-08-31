SELECT c.country, o.status, count(*) AS orders
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.country IN ('FR', 'CA')
GROUP BY CUBE (c.country, o.status)
HAVING GROUPING(c.country) + GROUPING(o.status) = 1
ORDER BY c.country, o.status;
