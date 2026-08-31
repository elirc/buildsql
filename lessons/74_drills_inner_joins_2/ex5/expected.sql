SELECT p.category,
       count(*) AS item_lines,
       count(DISTINCT oi.order_id) AS orders_touched,
       sum(oi.quantity) AS units
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE p.price > 450
GROUP BY p.category
ORDER BY p.category;
