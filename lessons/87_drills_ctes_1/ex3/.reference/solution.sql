SELECT p.category, sum(oi.quantity) AS units
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.category
ORDER BY units DESC, p.category;
