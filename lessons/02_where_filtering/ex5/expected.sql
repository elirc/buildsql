SELECT id, status, total
FROM orders
WHERE status <> 'cancelled'
  AND total < 10;
