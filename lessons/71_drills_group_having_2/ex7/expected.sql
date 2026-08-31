SELECT date_trunc('month', created_at) AS month,
       count(*) AS orders,
       count(*) FILTER (WHERE status = 'cancelled') AS cancelled,
       round(100.0 * count(*) FILTER (WHERE status = 'cancelled') / count(*), 2) AS cancel_pct
FROM orders
GROUP BY 1
HAVING 100.0 * count(*) FILTER (WHERE status = 'cancelled') / count(*) > 16.7
ORDER BY 1;
