SELECT id, status, total
FROM orders
WHERE status IN ('pending', 'paid')
  AND total > 1000;
