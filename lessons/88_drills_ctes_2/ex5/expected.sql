WITH monthly AS (
    SELECT date_trunc('month', created_at) AS month, count(*) AS orders
    FROM orders
    GROUP BY 1
)
SELECT cur.month, cur.orders, prev.orders AS prev_orders
FROM monthly cur
LEFT JOIN monthly prev ON prev.month = cur.month - INTERVAL '1 month'
ORDER BY cur.month;
