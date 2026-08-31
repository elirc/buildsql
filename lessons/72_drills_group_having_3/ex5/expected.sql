SELECT customer_id, count(*) AS orders, round(avg(total), 2) AS avg_total
FROM orders
GROUP BY customer_id
HAVING count(*) >= 18 AND avg(total) > 1200
ORDER BY customer_id;
