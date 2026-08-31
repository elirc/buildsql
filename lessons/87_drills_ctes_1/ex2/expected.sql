WITH per_status AS (
    SELECT status, count(*) AS orders, sum(total) AS revenue
    FROM orders
    GROUP BY status
)
SELECT status,
       orders,
       round(revenue, 2) AS revenue,
       round(100 * revenue / (SELECT sum(revenue) FROM per_status), 2)
         AS pct_of_revenue
FROM per_status
ORDER BY status;
