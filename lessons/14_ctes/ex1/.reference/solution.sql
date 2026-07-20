WITH heavy AS (
    SELECT customer_id, count(*) AS n
    FROM orders
    GROUP BY customer_id
    HAVING count(*) > 20
)
SELECT c.id, c.name, heavy.n
FROM heavy
JOIN customers c ON c.id = heavy.customer_id;
