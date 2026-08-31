WITH grand AS (SELECT sum(total) AS revenue FROM orders)
SELECT o.status,
       count(*) AS orders,
       round(sum(o.total), 2) AS revenue,
       round(100.0 * sum(o.total) / (SELECT revenue FROM grand), 2) AS revenue_pct
FROM orders o
GROUP BY o.status
ORDER BY o.status;
