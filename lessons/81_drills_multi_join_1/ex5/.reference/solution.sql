WITH per_order AS (
    SELECT o.id, o.status,
           coalesce(s.lines, 0) AS lines,
           coalesce(s.units, 0) AS units
    FROM orders o
    LEFT JOIN (SELECT oi.order_id,
                      count(*) AS lines,
                      sum(oi.quantity) AS units
               FROM order_items oi
               JOIN orders o2 ON o2.id = oi.order_id
                    AND o2.created_at >= DATE '2023-11-01'
               GROUP BY oi.order_id) s ON s.order_id = o.id
    WHERE o.created_at >= DATE '2023-11-01'
)
SELECT status, round(avg(lines), 2), round(avg(units), 2)
FROM per_order
GROUP BY status
ORDER BY status;
