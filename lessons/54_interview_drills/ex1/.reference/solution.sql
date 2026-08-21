SELECT country, id, name, revenue
FROM (
  SELECT c.country, c.id, c.name, sum(o.total) AS revenue,
         row_number() OVER (PARTITION BY c.country
                            ORDER BY sum(o.total) DESC, c.id) AS rn
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  WHERE o.status <> 'cancelled'
  GROUP BY c.country, c.id, c.name
) ranked
WHERE rn <= 3
ORDER BY country, revenue DESC, id;
