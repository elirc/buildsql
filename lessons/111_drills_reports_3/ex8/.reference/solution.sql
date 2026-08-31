WITH oc AS (
  SELECT DISTINCT oi.order_id, p.category
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id)
SELECT a.category AS cat_a,
       b.category AS cat_b,
       count(*) AS orders
FROM oc a
JOIN oc b ON b.order_id = a.order_id
         AND a.category < b.category
GROUP BY a.category, b.category
ORDER BY orders DESC, cat_a ASC, cat_b ASC;
