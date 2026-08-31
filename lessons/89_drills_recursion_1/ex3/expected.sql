WITH RECURSIVE months AS (
    SELECT date_trunc('month', min(created_at)) AS month
    FROM orders
    UNION ALL
    SELECT month + INTERVAL '1 month'
    FROM months
    WHERE month < (SELECT date_trunc('month', max(created_at)) FROM orders)
)
SELECT m.month, count(o.id) AS orders
FROM months m
LEFT JOIN orders o ON date_trunc('month', o.created_at) = m.month
GROUP BY m.month
ORDER BY m.month;
