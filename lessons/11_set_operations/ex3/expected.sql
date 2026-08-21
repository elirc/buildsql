SELECT id FROM customers WHERE country = 'US'
INTERSECT
SELECT customer_id FROM orders WHERE total > 1900;
