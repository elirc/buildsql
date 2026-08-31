WITH banded AS (
  SELECT CASE WHEN price < 100 THEN 'under 100'
              WHEN price < 300 THEN '100 to 299.99'
              ELSE '300 and up' END AS band,
         price
  FROM products
  WHERE category = 'toys')
SELECT band, count(*) AS products, round(avg(price), 2) AS avg_price
FROM banded
GROUP BY band
ORDER BY CASE band WHEN 'under 100' THEN 1
                   WHEN '100 to 299.99' THEN 2
                   ELSE 3 END;
