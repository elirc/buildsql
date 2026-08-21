SELECT DISTINCT p.id, p.name
FROM products p
JOIN order_items oi ON oi.product_id = p.id
WHERE p.category = 'garden';
