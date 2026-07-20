WITH rev AS (
  SELECT p.category,
    sum(oi.quantity * oi.price) FILTER (WHERE o.created_at >= '2023-09-01'
        AND o.created_at < '2023-10-01') AS sep_rev,
    sum(oi.quantity * oi.price) FILTER (WHERE o.created_at >= '2023-10-01'
        AND o.created_at < '2023-11-01') AS oct_rev
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  GROUP BY p.category)
SELECT category, sep_rev, oct_rev,
       round(100 * (oct_rev - sep_rev) / sep_rev, 1)
FROM rev ORDER BY 4 DESC, category;
