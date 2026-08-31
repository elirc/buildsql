WITH monthly AS (
  SELECT date_trunc('month', o.created_at) AS month,
         sum(oi.quantity * oi.price) AS revenue
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN products p ON p.id = oi.product_id
  WHERE p.category = 'electronics'
    AND o.created_at >= '2023-01-01' AND o.created_at < '2024-01-01'
  GROUP BY date_trunc('month', o.created_at)),
lagged AS (
  SELECT month, revenue,
         lag(revenue, 1) OVER (ORDER BY month) AS r1,
         lag(revenue, 2) OVER (ORDER BY month) AS r2,
         lag(revenue, 3) OVER (ORDER BY month) AS r3
  FROM monthly),
manual AS (
  SELECT month, revenue,
         (coalesce(r1, 0) + coalesce(r2, 0) + coalesce(r3, 0))
         / NULLIF((CASE WHEN r1 IS NULL THEN 0 ELSE 1 END)
                + (CASE WHEN r2 IS NULL THEN 0 ELSE 1 END)
                + (CASE WHEN r3 IS NULL THEN 0 ELSE 1 END), 0) AS prior3
  FROM lagged)
SELECT month,
       revenue,
       round(prior3, 2) AS prior3_avg,
       CASE WHEN prior3 IS NULL THEN NULL
            WHEN revenue > prior3 THEN 'above'
            ELSE 'below' END AS flag
FROM manual
ORDER BY month;
