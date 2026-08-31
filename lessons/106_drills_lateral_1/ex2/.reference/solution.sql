SELECT DISTINCT ON (customer_id)
       customer_id, id AS order_id, total
FROM orders
WHERE customer_id <= 15
ORDER BY customer_id, total DESC, id ASC;
