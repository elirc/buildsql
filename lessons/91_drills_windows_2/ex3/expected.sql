SELECT date_trunc('month', created_at) AS month,
       count(*) AS orders,
       round(sum(total), 2) AS revenue,
       round(100 * sum(total) / sum(sum(total)) OVER (), 2) AS pct_of_year
FROM orders
GROUP BY 1
ORDER BY month;
