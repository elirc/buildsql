SELECT id,
       to_char(created_at, 'YYYY-MM-DD') || ' ' || to_char(created_at, 'HH24:MI') AS stamp,
       trim(to_char(created_at, 'Day')) AS day_name
FROM orders
WHERE id <= 15
ORDER BY 1;
