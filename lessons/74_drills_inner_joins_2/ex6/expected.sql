SELECT c.country,
       count(*) AS orders,
       round(avg(o.total), 2) AS avg_order
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status <> 'cancelled'
GROUP BY c.country
HAVING avg(o.total) > 1005
ORDER BY c.country;
