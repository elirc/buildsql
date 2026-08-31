SELECT o.id, o.created_at,
       (SELECT count(*)
        FROM orders x
        WHERE x.customer_id = o.customer_id
          AND x.created_at > o.created_at
          AND x.created_at < o.created_at + interval '30 days') AS within_30d
FROM orders o
WHERE o.customer_id = 42
ORDER BY 2, 1;
