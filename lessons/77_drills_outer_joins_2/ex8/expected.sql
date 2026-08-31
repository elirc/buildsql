SELECT coalesce(s.product_id, r.product_id) AS product_id,
       coalesce(s.units, 0) AS units,
       coalesce(r.praises, 0) AS praises,
       CASE WHEN s.product_id IS NOT NULL AND r.product_id IS NOT NULL THEN 'both'
            WHEN s.product_id IS NOT NULL THEN 'sales only'
            ELSE 'praise only' END AS bucket
FROM (SELECT oi.product_id, sum(oi.quantity) AS units
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= '2023-11-13'
      GROUP BY oi.product_id) s
FULL JOIN (SELECT product_id, count(*) AS praises
           FROM reviews
           WHERE rating = 5 AND created_at >= '2023-11-13'
           GROUP BY product_id) r ON r.product_id = s.product_id
ORDER BY 1;
