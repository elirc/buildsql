SELECT c.country, sum(o.total)
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.country;
