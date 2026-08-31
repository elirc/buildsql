WITH prod_rev AS (
  SELECT p.category, p.id, p.name, sum(oi.quantity * oi.price) AS revenue
  FROM products p
  JOIN order_items oi ON oi.product_id = p.id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status <> 'cancelled'
  GROUP BY p.category, p.id, p.name),
tot AS (
  SELECT category, sum(revenue) AS cat_rev
  FROM prod_rev
  GROUP BY category),
best AS (
  SELECT DISTINCT ON (category)
         category, id, name, revenue
  FROM prod_rev
  ORDER BY category, revenue DESC, id ASC)
SELECT b.category, b.id AS product_id, b.name, b.revenue,
       round(100.0 * b.revenue / t.cat_rev, 1) AS cat_share_pct
FROM best b
JOIN tot t USING (category)
ORDER BY b.category;
