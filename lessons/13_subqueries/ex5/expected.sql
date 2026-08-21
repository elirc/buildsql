SELECT c.id, c.name,
       (SELECT count(*) FROM orders o WHERE o.customer_id = c.id) AS orders
FROM customers c
WHERE c.id <= 20;
