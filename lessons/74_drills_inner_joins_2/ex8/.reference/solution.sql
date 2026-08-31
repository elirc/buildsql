SELECT p.category,
       count(*) AS lines,
       sum(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_lines,
       round(100.0 * sum(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)
             / count(*), 2) AS cancelled_pct
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE p.category = 'books' OR p.category = 'toys'
GROUP BY p.category
ORDER BY p.category;
