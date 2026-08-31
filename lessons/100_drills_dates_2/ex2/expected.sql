SELECT id,
       to_char(created_at, 'YYYY-MM-DD HH24:MI') AS stamp,
       to_char(created_at, 'FMDay') AS day_name
FROM orders
WHERE id <= 15
ORDER BY id;
