SELECT date_trunc('month', created_at) AS month,
       sum(total) AS revenue
FROM orders
GROUP BY date_trunc('month', created_at)
ORDER BY month;
