SELECT floor(price / 100) * 100 AS price_floor,
       count(*) AS products,
       round(avg(price), 2) AS avg_price
FROM products
GROUP BY 1
ORDER BY 1;
