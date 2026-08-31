SELECT min(created_at) AS first_order,
       max(created_at) AS last_order,
       max(created_at)::date - min(created_at)::date AS span_days
FROM orders;
