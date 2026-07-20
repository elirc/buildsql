UPDATE products
SET price = round(price * 0.9, 2)
WHERE category = 'garden'
  AND NOT EXISTS (SELECT 1 FROM order_items oi
                  WHERE oi.product_id = products.id);
