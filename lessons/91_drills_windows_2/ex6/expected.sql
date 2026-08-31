SELECT p.category,
       p.attributes->>'color' AS color,
       count(*) AS products,
       round(avg(p.price), 2) AS avg_price,
       sum(count(*)) OVER (PARTITION BY p.category) AS category_products
FROM products p
GROUP BY p.category, p.attributes->>'color'
ORDER BY p.category, color;
