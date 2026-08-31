WITH mine AS (
    SELECT id, customer_id, created_at, total
    FROM orders
    WHERE customer_id <= 8
)
SELECT m.customer_id, m.id, m.created_at, m.total,
       round((SELECT sum(x.total) FROM mine x
              WHERE x.customer_id = m.customer_id
                AND (x.created_at, x.id) <= (m.created_at, m.id)), 2)
         AS running_spend
FROM mine m
ORDER BY m.customer_id, m.created_at, m.id;
