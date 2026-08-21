WITH spend AS (
  SELECT c.country, c.id, c.name, sum(o.total) AS revenue
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status <> 'cancelled'
  GROUP BY c.country, c.id, c.name),
ranked AS (
  SELECT country, id, name, revenue,
         row_number() OVER (PARTITION BY country
                            ORDER BY revenue DESC, id) AS rn
  FROM spend)
SELECT country, id, name, revenue
FROM ranked
WHERE rn <= 3
ORDER BY country, revenue DESC, id;
