SELECT c.country, count(*) AS never_ordered
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL
GROUP BY c.country
ORDER BY c.country;
