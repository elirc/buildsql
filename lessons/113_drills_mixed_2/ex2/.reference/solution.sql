SELECT count(*) AS pending_orders,
       round(sum(DATE '2023-11-14' - created_at::date)::numeric / count(*), 1) AS avg_age_days
FROM orders
WHERE status = 'pending';
