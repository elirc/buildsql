SELECT id, customer_id, total
FROM orders
ORDER BY total DESC, id ASC
LIMIT 15;
