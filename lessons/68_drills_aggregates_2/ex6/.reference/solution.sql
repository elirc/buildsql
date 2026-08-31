SELECT count(*) AS orders,
       count(DISTINCT customer_id) AS customers,
       count(DISTINCT CASE WHEN status = 'cancelled' THEN customer_id END) AS cancellers,
       count(DISTINCT date_trunc('month', created_at)) AS months
FROM orders;
