SELECT p.id, p.name, p.category, p.price,
       a.in_category,
       round(p.price - a.avg_price, 2) AS vs_avg
FROM products p
JOIN (SELECT category, count(*) AS in_category, avg(price) AS avg_price
      FROM products
      WHERE price > 480
      GROUP BY category) a ON a.category = p.category
WHERE p.price > 480
ORDER BY p.category, p.id;
