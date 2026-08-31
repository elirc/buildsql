SELECT category, id, name, price
FROM (SELECT category, id, name, price,
             row_number() OVER (PARTITION BY category
                                ORDER BY price DESC, id) AS rn
      FROM products) t
WHERE rn = 2
ORDER BY category;
