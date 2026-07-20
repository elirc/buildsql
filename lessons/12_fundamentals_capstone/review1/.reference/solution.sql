SELECT c.country, sum(o.total) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
  AND o.created_at >= '2023-07-01'
  AND o.created_at < '2023-10-01'
GROUP BY c.country;
