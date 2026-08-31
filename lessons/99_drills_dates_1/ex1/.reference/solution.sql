SELECT id,
       created_at,
       cast(created_at AS date) AS order_date,
       date_trunc('hour', created_at) AS hour_bucket
FROM orders
WHERE id <= 20
ORDER BY 1;
