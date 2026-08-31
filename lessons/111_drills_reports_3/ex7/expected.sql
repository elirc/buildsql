SELECT c.country,
       count(DISTINCT o.customer_id) AS buyers,
       sum(o.total) AS revenue,
       round(sum(o.total) / count(DISTINCT o.customer_id), 2) AS per_buyer
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status <> 'cancelled'
GROUP BY c.country
HAVING count(DISTINCT o.customer_id) >= 100
ORDER BY per_buyer DESC, country ASC;
