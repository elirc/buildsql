WITH rev AS (
  SELECT date_trunc('month', o.created_at) AS month,
         c.country,
         sum(o.total) AS revenue
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE o.status <> 'cancelled'
    AND o.created_at >= '2023-01-01' AND o.created_at < '2024-01-01'
  GROUP BY date_trunc('month', o.created_at), c.country),
ranked AS (
  SELECT month, country, revenue,
         row_number() OVER (PARTITION BY month
                            ORDER BY revenue DESC, country ASC) AS rn
  FROM rev)
SELECT month, country, revenue
FROM ranked
WHERE rn = 1
ORDER BY revenue DESC, month ASC;
