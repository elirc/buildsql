SELECT c.id, c.name, coalesce(t.n, 0) AS orders
FROM customers c
LEFT JOIN (SELECT customer_id, count(*) AS n
           FROM orders
           GROUP BY customer_id) t ON t.customer_id = c.id
WHERE c.country = 'ES'
ORDER BY c.id;
