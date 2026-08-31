SELECT day, revenue, lag(revenue, 7) OVER (ORDER BY day) AS week_ago
FROM (SELECT date_trunc('day', created_at) AS day, sum(total) AS revenue
      FROM orders
      WHERE status = 'shipped'
        AND created_at >= '2023-08-01'
        AND created_at < '2023-09-01'
      GROUP BY date_trunc('day', created_at)) d
ORDER BY day;
