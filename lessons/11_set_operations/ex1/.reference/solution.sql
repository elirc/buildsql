SELECT customer_id FROM orders WHERE total > 1990
UNION
SELECT id FROM customers WHERE country = 'BR';
