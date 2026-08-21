-- 50_grouping_sets/challenge reference
SELECT p.category, o.status,
       sum(oi.quantity * oi.price) AS revenue,
       GROUPING(o.status) AS is_subtotal
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders   o ON o.id = oi.order_id
GROUP BY ROLLUP (p.category, o.status);
