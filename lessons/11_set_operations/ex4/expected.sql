SELECT customer_id FROM orders WHERE total > 1995
UNION ALL
SELECT id FROM customers WHERE country = 'AU';
