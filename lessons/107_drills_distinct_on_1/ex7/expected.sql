WITH rev AS (
  SELECT date_trunc('month', o.created_at) AS month,
         c.country,
         sum(o.total) AS revenue
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE o.status <> 'cancelled'
    AND o.created_at >= '2023-01-01' AND o.created_at < '2024-01-01'
  GROUP BY date_trunc('month', o.created_at), c.country),
winners AS (
  SELECT DISTINCT ON (month)
         month, country, revenue
  FROM rev
  ORDER BY month, revenue DESC, country ASC)
SELECT month, country, revenue
FROM winners
ORDER BY revenue DESC, month ASC;
