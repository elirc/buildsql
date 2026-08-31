SELECT c.id, c.name, coalesce(x.n, 0) AS cancelled
FROM customers c
LEFT JOIN (SELECT customer_id, count(*) AS n
           FROM orders
           WHERE status = 'cancelled'
           GROUP BY customer_id) x ON x.customer_id = c.id
WHERE c.country = 'AU'
ORDER BY c.id;
