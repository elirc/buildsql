SELECT id, name, price,
       CASE
         WHEN price < 50  THEN 'budget'
         WHEN price < 200 THEN 'mid'
         ELSE 'premium'
       END AS tier
FROM products;
