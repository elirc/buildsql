SELECT id FROM customers WHERE country = 'JP'
UNION
SELECT customer_id FROM orders WHERE total > 1995
ORDER BY id
LIMIT 10;
