SELECT id, name, price,
       round(avg(price) OVER (PARTITION BY category), 2) AS category_avg
FROM products;
