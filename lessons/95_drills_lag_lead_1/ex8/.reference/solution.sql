SELECT day, revenue
FROM (SELECT day, revenue,
             lag(revenue)  OVER (ORDER BY day) AS prev,
             lead(revenue) OVER (ORDER BY day) AS next
      FROM (SELECT date_trunc('day', created_at) AS day, sum(total) AS revenue
            FROM orders
            WHERE created_at >= '2023-07-01' AND created_at < '2023-08-01'
            GROUP BY date_trunc('day', created_at)) daily) f
WHERE revenue < prev AND revenue < next
ORDER BY day;
