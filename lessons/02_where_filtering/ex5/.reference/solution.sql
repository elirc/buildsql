SELECT id, status, total
FROM orders
WHERE NOT (status = 'cancelled')
  AND total < 10;
