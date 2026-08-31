SELECT c.country,
       count(o.id) AS cancelled_orders,
       round(sum(o.total), 2) AS cancelled_value
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'cancelled'
GROUP BY c.country
ORDER BY c.country;
