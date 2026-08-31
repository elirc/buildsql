SELECT c.id, c.name, coalesce(s.n, 0) AS orders, s.biggest
FROM customers c
LEFT JOIN (SELECT customer_id, count(*) AS n, max(total) AS biggest
           FROM orders
           WHERE customer_id <= 12
           GROUP BY customer_id) s ON s.customer_id = c.id
WHERE c.id <= 12
ORDER BY c.id;
