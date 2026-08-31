SELECT c.id, c.name, coalesce(s.orders, 0), coalesce(s.units, 0)
FROM customers c
LEFT JOIN (SELECT o.customer_id,
                  count(DISTINCT o.id) AS orders,
                  coalesce(sum(oi.quantity), 0) AS units
           FROM orders o
           JOIN customers c2 ON c2.id = o.customer_id
                AND c2.country = 'BR'
                AND c2.created_at >= DATE '2023-06-01'
           LEFT JOIN order_items oi ON oi.order_id = o.id
           GROUP BY o.customer_id) s ON s.customer_id = c.id
WHERE c.country = 'BR' AND c.created_at >= DATE '2023-06-01'
ORDER BY c.id;
