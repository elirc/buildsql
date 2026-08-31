SELECT o.id, o.total, coalesce(b.n, 0)
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN (SELECT order_id, count(*) AS n
           FROM order_items
           WHERE quantity = 5
           GROUP BY order_id) b ON b.order_id = o.id
WHERE c.country = 'MX' AND o.created_at >= DATE '2023-11-01'
ORDER BY o.id;
