SELECT month, day, revenue
FROM (SELECT date_trunc('month', created_at) AS month,
             date_trunc('day', created_at) AS day,
             sum(total) AS revenue,
             row_number() OVER (PARTITION BY date_trunc('month', created_at)
                                ORDER BY sum(total) DESC,
                                         date_trunc('day', created_at)) AS rn
      FROM orders
      GROUP BY date_trunc('month', created_at),
               date_trunc('day', created_at)) t
WHERE rn = 1
ORDER BY month;
