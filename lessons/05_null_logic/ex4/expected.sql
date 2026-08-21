SELECT id, name
FROM products
WHERE id NOT IN (SELECT product_id FROM order_items WHERE order_id <= 1000);
