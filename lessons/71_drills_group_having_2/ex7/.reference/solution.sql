SELECT date_trunc('month', created_at) AS month,
       count(*) AS orders,
       sum(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       round(100.0 * sum(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)
             / count(*), 2) AS cancel_pct
FROM orders
GROUP BY 1
HAVING sum(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100.0 / count(*) > 16.7
ORDER BY 1;
