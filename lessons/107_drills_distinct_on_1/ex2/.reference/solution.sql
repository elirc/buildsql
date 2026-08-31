WITH live AS (
  SELECT customer_id, id, status, created_at,
         row_number() OVER (PARTITION BY customer_id
                            ORDER BY created_at DESC, id DESC) AS rn
  FROM orders
  WHERE customer_id <= 25
    AND status <> 'cancelled')
SELECT customer_id, id AS order_id, status, created_at
FROM live
WHERE rn = 1
ORDER BY customer_id;
