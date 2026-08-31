SELECT c.country, o.status,
       count(o.id) AS orders,
       round(sum(o.total), 2) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'US' OR c.country = 'GB'
GROUP BY 1, 2
ORDER BY 1, 2;
