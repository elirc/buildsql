SELECT id, status, total
FROM orders
WHERE status = 'paid'
  AND (total < 20 OR total > 1980);
