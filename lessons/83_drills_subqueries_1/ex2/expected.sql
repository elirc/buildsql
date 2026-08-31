SELECT c.id, c.name,
       (SELECT count(*) FROM orders o WHERE o.customer_id = c.id) AS orders,
       (SELECT max(o.total) FROM orders o WHERE o.customer_id = c.id) AS biggest
FROM customers c
WHERE c.id <= 12
ORDER BY c.id;
