SELECT c.country,
       count(DISTINCT c.id) AS customers,
       count(DISTINCT c.id) FILTER (WHERE o.status = 'paid') AS paid_buyers,
       round(100.0 * count(DISTINCT c.id) FILTER (WHERE o.status = 'paid')
             / count(DISTINCT c.id), 1) AS pct
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.country
ORDER BY c.country;
