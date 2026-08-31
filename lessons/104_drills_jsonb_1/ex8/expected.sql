SELECT attributes->>'color' AS color,
       count(*) AS products,
       count(*) FILTER (WHERE attributes->'tags' ? 'sale') AS on_sale,
       round(100.0 * count(*) FILTER (WHERE attributes->'tags' ? 'sale')
             / count(*), 1) AS pct_sale
FROM products
GROUP BY attributes->>'color'
ORDER BY color;
