SELECT attributes->>'color' AS color,
       count(*) AS products,
       count(CASE WHEN attributes @> '{"tags": ["sale"]}' THEN 1 END) AS on_sale,
       round(100.0 * count(CASE WHEN attributes @> '{"tags": ["sale"]}' THEN 1 END)
             / count(*), 1) AS pct_sale
FROM products
GROUP BY 1
ORDER BY 1;
