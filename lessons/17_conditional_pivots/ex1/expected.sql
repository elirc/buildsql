SELECT p.category,
  sum(CASE WHEN o.status = 'pending' THEN oi.quantity * oi.price END),
  sum(CASE WHEN o.status = 'paid' THEN oi.quantity * oi.price END),
  sum(CASE WHEN o.status = 'shipped' THEN oi.quantity * oi.price END),
  sum(CASE WHEN o.status = 'cancelled' THEN oi.quantity * oi.price END)
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
GROUP BY p.category;
