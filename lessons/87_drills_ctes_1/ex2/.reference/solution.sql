SELECT status,
       count(*) AS orders,
       round(sum(total), 2) AS revenue,
       round(100 * sum(total) / sum(sum(total)) OVER (), 2) AS pct_of_revenue
FROM orders
GROUP BY status
ORDER BY status;
