SELECT c.country, o.status,
       count(*) AS orders,
       round(100.0 * count(*) / sum(count(*)) OVER (PARTITION BY c.country), 2)
         AS pct_of_country
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.country, o.status
ORDER BY c.country, o.status;
