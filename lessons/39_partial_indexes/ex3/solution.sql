SELECT id, customer_id, total
FROM orders
WHERE status = 'cancelled' AND total > 1990;
