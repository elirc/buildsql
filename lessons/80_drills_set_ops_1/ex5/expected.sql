SELECT customer_id, status FROM orders
WHERE created_at >= '2023-10-01' AND created_at < '2023-11-01'
EXCEPT
SELECT customer_id, status FROM orders
WHERE created_at >= '2023-11-01'
ORDER BY 1, 2;
