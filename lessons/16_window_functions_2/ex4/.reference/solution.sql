WITH daily AS (
    SELECT date_trunc('day', created_at) AS day,
           status,
           sum(total) AS revenue
    FROM orders
    WHERE created_at >= '2023-10-01'
      AND created_at <  '2023-11-01'
    GROUP BY 1, 2
)
SELECT day,
       status,
       revenue,
       sum(revenue) OVER (PARTITION BY status ORDER BY day) AS running
FROM daily
ORDER BY status, day;
