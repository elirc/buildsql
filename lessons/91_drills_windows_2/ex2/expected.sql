SELECT id, customer_id, total,
       count(*) OVER (PARTITION BY customer_id) AS customer_orders,
       round(sum(total) OVER (PARTITION BY customer_id), 2) AS customer_total
FROM orders
WHERE customer_id <= 15
ORDER BY customer_id, id;
