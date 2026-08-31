SELECT c.country,
       count(o.id) AS orders,
       round(avg(o.total), 2) AS avg_order
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status != 'cancelled'
GROUP BY c.country
HAVING avg(o.total) > 1005
ORDER BY 1;
