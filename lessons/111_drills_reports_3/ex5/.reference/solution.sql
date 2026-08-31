WITH prod_rev AS (
  SELECT p.category, p.id, p.name, sum(oi.quantity * oi.price) AS revenue
  FROM products p
  JOIN order_items oi ON oi.product_id = p.id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status <> 'cancelled'
  GROUP BY p.category, p.id, p.name),
w AS (
  SELECT category, id, name, revenue,
         row_number() OVER (PARTITION BY category
                            ORDER BY revenue DESC, id ASC) AS rn,
         sum(revenue) OVER (PARTITION BY category) AS cat_rev
  FROM prod_rev)
SELECT category, id AS product_id, name, revenue,
       round(100.0 * revenue / cat_rev, 1) AS cat_share_pct
FROM w
WHERE rn = 1
ORDER BY category;
