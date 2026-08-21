WITH stats AS (
  SELECT c.country,
         sum(o.total) FILTER (WHERE o.status <> 'cancelled') AS revenue,
         count(*) AS orders,
         count(DISTINCT o.customer_id) AS buyers,
         round(avg(o.total) FILTER (WHERE o.status <> 'cancelled'), 2)
             AS avg_order_value,
         round(100.0 * count(*) FILTER (WHERE o.status = 'cancelled')
               / count(*), 1) AS cancel_rate
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.country),
best AS (
  SELECT c.country, c.id, c.name, sum(o.total) AS spent
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  WHERE o.status <> 'cancelled'
  GROUP BY c.country, c.id, c.name)
SELECT s.country, s.revenue, s.orders, s.buyers, s.avg_order_value,
       s.cancel_rate, t.name AS top_customer
FROM stats s
CROSS JOIN LATERAL (
  SELECT b.name
  FROM best b
  WHERE b.country = s.country
  ORDER BY b.spent DESC, b.id
  LIMIT 1) t
ORDER BY s.revenue DESC;
