SELECT date_trunc('month', created_at) AS month,
       count(*) AS orders,
       sum(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       round(100.0 * sum(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / count(*), 1) AS cancel_pct
FROM orders
WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01'
GROUP BY date_trunc('month', created_at)
ORDER BY month;
