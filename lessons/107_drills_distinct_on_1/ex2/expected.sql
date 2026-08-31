SELECT DISTINCT ON (customer_id)
       customer_id, id AS order_id, status, created_at
FROM orders
WHERE customer_id <= 25
  AND status <> 'cancelled'
ORDER BY customer_id, created_at DESC, id DESC;
