SELECT id, name, category,
       round(price - avg(price) OVER (PARTITION BY category), 2) AS vs_category
FROM products;
