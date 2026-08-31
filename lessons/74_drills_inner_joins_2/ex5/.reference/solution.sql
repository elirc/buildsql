SELECT p.category,
       count(oi.id) AS item_lines,
       count(DISTINCT oi.order_id) AS orders_touched,
       sum(oi.quantity) AS units
FROM products p
JOIN order_items oi ON oi.product_id = p.id
WHERE p.price > 450
GROUP BY p.category
ORDER BY 1;
