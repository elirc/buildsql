SELECT customer_id, count(*) AS orders, round(sum(total), 2) AS revenue
FROM orders
WHERE created_at >= '2023-01-01'::timestamptz
GROUP BY customer_id
HAVING count(*) > 15
ORDER BY customer_id;
