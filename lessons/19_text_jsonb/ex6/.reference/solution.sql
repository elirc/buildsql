SELECT attributes ->> 'color' AS color,
       count(*) AS products
FROM products
GROUP BY color;
