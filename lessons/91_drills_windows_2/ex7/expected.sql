SELECT DISTINCT category,
       count(*) OVER (PARTITION BY category) AS products,
       round(avg(price) OVER (PARTITION BY category), 2) AS avg_price
FROM products
ORDER BY category;
