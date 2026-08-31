SELECT count(*) AS pending_orders,
       round(avg(DATE '2023-11-14' - created_at::date), 1) AS avg_age_days
FROM orders
WHERE status = 'pending';
