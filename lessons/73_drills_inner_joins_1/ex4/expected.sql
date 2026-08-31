SELECT c.country,
       count(*) AS cancelled_orders,
       round(sum(o.total), 2) AS cancelled_value
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'cancelled'
GROUP BY c.country
ORDER BY c.country;
