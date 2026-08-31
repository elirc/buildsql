SELECT CASE WHEN price < 100 THEN 'under 100'
            WHEN price < 300 THEN '100 to 299.99'
            ELSE '300 and up' END AS band,
       count(*) AS products,
       round(avg(price), 2) AS avg_price
FROM products
WHERE category = 'toys'
GROUP BY CASE WHEN price < 100 THEN 'under 100'
              WHEN price < 300 THEN '100 to 299.99'
              ELSE '300 and up' END
ORDER BY min(price);
