SELECT c.country, o.status,
       count(*) AS orders,
       round(sum(o.total), 2) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.country IN ('US', 'GB')
GROUP BY c.country, o.status
ORDER BY c.country, o.status;
