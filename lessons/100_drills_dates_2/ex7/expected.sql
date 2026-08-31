SELECT c.id AS customer_id,
       c.created_at::date AS signed_up,
       min(o.created_at)::date AS first_order,
       min(o.created_at)::date - c.created_at::date AS days_to_first
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.id <= 100
GROUP BY c.id, c.created_at
ORDER BY c.id;
