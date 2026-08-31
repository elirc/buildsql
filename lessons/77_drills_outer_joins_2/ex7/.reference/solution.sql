SELECT p.id, p.name,
       coalesce(s.good, 0) AS good_units,
       coalesce(s.lost, 0) AS lost_units
FROM products p
LEFT JOIN (SELECT oi.product_id,
                  sum(oi.quantity) FILTER (WHERE o.status <> 'cancelled') AS good,
                  sum(oi.quantity) FILTER (WHERE o.status = 'cancelled') AS lost
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           WHERE oi.quantity = 5
             AND o.created_at >= DATE '2023-11-01'
           GROUP BY oi.product_id) s ON s.product_id = p.id
WHERE p.category = 'toys' AND p.price > 490
ORDER BY p.id;
