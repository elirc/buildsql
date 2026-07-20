WITH pending AS (
    SELECT * FROM orders WHERE status = 'pending'
)
SELECT c.country, sum(p.total) AS revenue
FROM pending p
JOIN customers c ON c.id = p.customer_id
GROUP BY c.country;
