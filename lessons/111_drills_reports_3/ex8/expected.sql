SELECT p1.category AS cat_a,
       p2.category AS cat_b,
       count(DISTINCT oi1.order_id) AS orders
FROM order_items oi1
JOIN order_items oi2 ON oi2.order_id = oi1.order_id
JOIN products p1 ON p1.id = oi1.product_id
JOIN products p2 ON p2.id = oi2.product_id
WHERE p1.category < p2.category
GROUP BY p1.category, p2.category
ORDER BY orders DESC, cat_a ASC, cat_b ASC;
