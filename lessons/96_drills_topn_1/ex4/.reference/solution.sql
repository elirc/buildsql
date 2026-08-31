SELECT category, id, name, price
FROM (SELECT category, id, name, price,
             dense_rank() OVER (PARTITION BY category
                                ORDER BY price DESC) AS dr
      FROM products) t
WHERE dr <= 2
ORDER BY category, price DESC, id;
