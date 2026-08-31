WITH spans AS (
  SELECT customer_id,
         min(created_at)::date AS first_order,
         max(created_at)::date AS last_order
  FROM orders
  WHERE customer_id <= 200
  GROUP BY customer_id)
SELECT customer_id, first_order, last_order,
       last_order - first_order AS span_days
FROM spans
WHERE last_order - first_order >= 300
ORDER BY 4 DESC, 1;
