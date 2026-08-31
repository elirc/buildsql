SELECT customer_id,
       min(created_at)::date AS first_order,
       max(created_at)::date AS last_order,
       max(created_at)::date - min(created_at)::date AS span_days
FROM orders
WHERE customer_id <= 200
GROUP BY customer_id
HAVING max(created_at)::date - min(created_at)::date >= 300
ORDER BY span_days DESC, customer_id;
