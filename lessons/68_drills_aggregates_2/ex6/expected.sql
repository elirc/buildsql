SELECT count(*) AS orders,
       count(DISTINCT customer_id) AS customers,
       count(DISTINCT customer_id) FILTER (WHERE status = 'cancelled') AS cancellers,
       count(DISTINCT date_trunc('month', created_at)) AS months
FROM orders;
