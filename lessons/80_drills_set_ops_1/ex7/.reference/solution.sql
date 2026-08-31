SELECT u.id
FROM (SELECT id FROM customers WHERE country = 'JP'
      UNION
      SELECT customer_id FROM orders WHERE total > 1995) u
ORDER BY u.id
LIMIT 10;
