SELECT c.country, count(*) AS never_ordered
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
GROUP BY c.country
ORDER BY c.country;
