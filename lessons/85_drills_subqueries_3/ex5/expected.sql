SELECT id, customer_id, status, total, created_at
FROM orders
WHERE customer_id = (SELECT customer_id
                     FROM orders
                     GROUP BY customer_id
                     ORDER BY count(*) DESC, customer_id
                     LIMIT 1)
ORDER BY id;
