WITH paid AS (
  SELECT DISTINCT customer_id
  FROM orders
  WHERE status = 'paid')
SELECT c.country,
       count(*) AS customers,
       count(p.customer_id) AS paid_buyers,
       round(100.0 * count(p.customer_id) / count(*), 1) AS pct
FROM customers c
LEFT JOIN paid p ON p.customer_id = c.id
GROUP BY c.country
ORDER BY c.country;
