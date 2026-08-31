SELECT id, status, total
FROM orders
WHERE (status = 'shipped' OR status = 'cancelled')
  AND total < 15;
