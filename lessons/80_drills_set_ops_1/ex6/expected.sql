SELECT customer_id FROM orders
WHERE customer_id <= 2000
  AND created_at >= '2023-10-01' AND created_at < '2023-11-01'
EXCEPT ALL
SELECT customer_id FROM orders
WHERE customer_id <= 2000
  AND created_at >= '2023-11-01'
ORDER BY 1;
