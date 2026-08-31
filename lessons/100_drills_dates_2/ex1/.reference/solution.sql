SELECT id, created_at,
       cast(date_part('epoch', created_at) AS bigint) AS epoch_seconds
FROM orders
WHERE id <= 15
ORDER BY 1;
