SELECT p.category,
       count(*) AS lines,
       count(*) FILTER (WHERE o.status = 'cancelled') AS cancelled_lines,
       round(100.0 * count(*) FILTER (WHERE o.status = 'cancelled') / count(*), 2) AS cancelled_pct
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN products p ON p.id = oi.product_id
WHERE p.category IN ('books', 'toys')
GROUP BY p.category
ORDER BY p.category;
