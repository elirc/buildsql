WITH a AS (
    SELECT customer_id, count(*) AS n
    FROM orders
    WHERE customer_id <= 2000
      AND created_at >= DATE '2023-10-01'
      AND created_at <  DATE '2023-11-01'
    GROUP BY customer_id
), b AS (
    SELECT customer_id, count(*) AS n
    FROM orders
    WHERE customer_id <= 2000
      AND created_at >= DATE '2023-11-01'
    GROUP BY customer_id
)
SELECT a.customer_id
FROM a
LEFT JOIN b ON b.customer_id = a.customer_id
CROSS JOIN LATERAL generate_series(1, (a.n - coalesce(b.n, 0))::int) g
ORDER BY 1;
