(SELECT customer_id FROM orders WHERE total > 1980
 EXCEPT
 SELECT id FROM customers WHERE country = 'AU')
UNION
(SELECT id FROM customers WHERE country = 'AU'
 EXCEPT
 SELECT customer_id FROM orders WHERE total > 1980);
