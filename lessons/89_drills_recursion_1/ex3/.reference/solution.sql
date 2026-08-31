SELECT g.month, count(o.id) AS orders
FROM generate_series(
         (SELECT date_trunc('month', min(created_at)) FROM orders),
         (SELECT date_trunc('month', max(created_at)) FROM orders),
         INTERVAL '1 month') AS g(month)
LEFT JOIN orders o ON date_trunc('month', o.created_at) = g.month
GROUP BY g.month
ORDER BY g.month;
