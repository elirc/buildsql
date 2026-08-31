WITH monthly AS (
  SELECT date_trunc('month', o.created_at) AS month,
         sum(oi.quantity * oi.price) AS revenue
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN products p ON p.id = oi.product_id
  WHERE p.category = 'electronics'
    AND o.created_at >= '2023-01-01' AND o.created_at < '2024-01-01'
  GROUP BY date_trunc('month', o.created_at)),
w AS (
  SELECT month, revenue,
         avg(revenue) OVER (ORDER BY month
                            ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING) AS prior3
  FROM monthly)
SELECT month,
       revenue,
       round(prior3, 2) AS prior3_avg,
       CASE WHEN prior3 IS NULL THEN NULL
            WHEN revenue > prior3 THEN 'above'
            ELSE 'below' END AS flag
FROM w
ORDER BY month;
