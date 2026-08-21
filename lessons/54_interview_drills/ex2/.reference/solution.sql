SELECT month, revenue, revenue - prev AS change
FROM (
  SELECT date_trunc('month', created_at) AS month,
         sum(total) AS revenue,
         lag(sum(total)) OVER (ORDER BY date_trunc('month', created_at)) AS prev
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY 1
) m
ORDER BY month;
