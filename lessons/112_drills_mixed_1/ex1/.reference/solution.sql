WITH clothing AS (
  SELECT id, attributes ->> 'color' AS color
  FROM products
  WHERE category = 'clothing')
SELECT c.color, sum(oi.quantity * oi.price) AS revenue
FROM order_items oi
JOIN clothing c ON c.id = oi.product_id
GROUP BY c.color
ORDER BY c.color;
