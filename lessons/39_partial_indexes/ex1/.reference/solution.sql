SELECT id, total
FROM orders
WHERE status = 'pending'
  AND total > 1990;
