SELECT DISTINCT ON (status)
       status, id AS order_id, created_at
FROM orders
ORDER BY status, created_at ASC, id ASC;
