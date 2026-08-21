WITH daily AS (
    SELECT date_trunc('day', created_at) AS day,
           sum(total) AS revenue
    FROM orders
    WHERE created_at >= '2023-10-01'
      AND created_at <  '2023-11-01'
    GROUP BY 1
)
SELECT day,
       revenue,
       max(revenue) OVER (ORDER BY day) AS best_so_far
FROM daily
ORDER BY day;
