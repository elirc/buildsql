SELECT i.id, pr.name, ord.status, i.quantity
FROM products pr
JOIN order_items i ON i.product_id = pr.id
JOIN orders ord ON ord.id = i.order_id
WHERE pr.category = 'electronics'
  AND pr.price > 490
ORDER BY i.id;
