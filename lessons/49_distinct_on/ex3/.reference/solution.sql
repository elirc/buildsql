SELECT DISTINCT ON (customer_id)
       customer_id, id, created_at
FROM orders
WHERE customer_id <= 30
ORDER BY customer_id, created_at ASC, id ASC;
