SELECT c.id AS customer_id, t.order_id, t.total
FROM customers c
CROSS JOIN LATERAL (
  SELECT o.id AS order_id, o.total
  FROM orders o
  WHERE o.customer_id = c.id
  ORDER BY o.total DESC, o.id ASC
  LIMIT 1) t
WHERE c.id <= 15
ORDER BY c.id;
