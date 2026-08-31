SELECT status,
       count(*) AS orders,
       round(sum(total), 2) AS revenue,
       round(100.0 * sum(total) / (SELECT sum(total) FROM orders), 2) AS revenue_pct
FROM orders
GROUP BY status
ORDER BY status;
