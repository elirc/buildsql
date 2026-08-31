SELECT country, customer_id, orders
FROM (SELECT c.country, o.customer_id, count(o.id) AS orders,
             row_number() OVER (PARTITION BY c.country
                                ORDER BY count(o.id) DESC, o.customer_id) AS rn
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      GROUP BY c.country, o.customer_id) t
WHERE rn = 1
ORDER BY country;
