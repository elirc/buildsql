SELECT p.category, count(*) AS never_ordered
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
WHERE oi.id IS NULL
GROUP BY p.category
ORDER BY p.category;
