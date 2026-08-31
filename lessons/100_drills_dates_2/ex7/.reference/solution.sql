WITH firsts AS (
  SELECT customer_id, min(created_at)::date AS first_order
  FROM orders
  GROUP BY customer_id)
SELECT c.id AS customer_id,
       c.created_at::date AS signed_up,
       f.first_order,
       f.first_order - c.created_at::date AS days_to_first
FROM customers c
LEFT JOIN firsts f ON f.customer_id = c.id
WHERE c.id <= 100
ORDER BY 1;
