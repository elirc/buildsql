SELECT id FROM customers WHERE country = 'US'
EXCEPT
SELECT customer_id FROM orders;
