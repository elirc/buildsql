SELECT p.category, count(*) AS never_ordered
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id)
GROUP BY p.category
ORDER BY p.category;
