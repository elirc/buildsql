SELECT t.category, t.revenue FROM
  (SELECT p.category, sum(oi.quantity * oi.price) AS revenue
   FROM order_items oi JOIN products p ON p.id = oi.product_id
   GROUP BY p.category) t
WHERE t.revenue > (SELECT avg(r2.revenue) FROM
  (SELECT sum(oi.quantity * oi.price) AS revenue
   FROM order_items oi JOIN products p ON p.id = oi.product_id
   GROUP BY p.category) r2);
