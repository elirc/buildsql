WITH per_country AS (
  SELECT c.country,
         sum(o.total) FILTER (WHERE o.status <> 'cancelled')           AS revenue,
         count(*)                                                      AS orders,
         count(DISTINCT o.customer_id)                                 AS buyers,
         round(avg(o.total) FILTER (WHERE o.status <> 'cancelled'), 2) AS avg_order_value,
         round(100.0 * count(*) FILTER (WHERE o.status = 'cancelled')
               / count(*), 1)                                          AS cancel_rate
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.country),
spend AS (
  SELECT c.country, c.name,
         row_number() OVER (PARTITION BY c.country
                            ORDER BY sum(o.total) DESC, c.id) AS rn
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status <> 'cancelled'
  GROUP BY c.country, c.id, c.name)
SELECT p.country, p.revenue, p.orders, p.buyers, p.avg_order_value,
       p.cancel_rate, s.name AS top_customer
FROM per_country p
JOIN spend s ON s.country = p.country AND s.rn = 1
ORDER BY p.revenue DESC;
