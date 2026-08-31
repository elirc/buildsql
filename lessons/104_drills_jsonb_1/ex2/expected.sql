SELECT attributes->>'size' AS size,
       count(*) AS products
FROM products
GROUP BY attributes->>'size'
ORDER BY size;
