SELECT d.category,
       round(d.avg_price, 2) AS avg_price,
       (SELECT count(*) FROM products p
        WHERE p.category = d.category AND p.price > d.avg_price) AS above_average
FROM (SELECT category, avg(price) AS avg_price
      FROM products
      GROUP BY category) d
ORDER BY d.category;
