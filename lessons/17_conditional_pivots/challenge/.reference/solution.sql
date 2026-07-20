WITH wide AS (
    SELECT p.category,
           sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'pending')   AS pending,
           sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'paid')      AS paid,
           sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'shipped')   AS shipped,
           sum(oi.quantity * oi.price) FILTER (WHERE o.status = 'cancelled') AS cancelled
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p     ON p.id = oi.product_id
    GROUP BY p.category
)
SELECT w.category, v.status, v.revenue
FROM wide w
CROSS JOIN LATERAL (VALUES
    ('pending',   w.pending),
    ('paid',      w.paid),
    ('shipped',   w.shipped),
    ('cancelled', w.cancelled)
) AS v(status, revenue);
