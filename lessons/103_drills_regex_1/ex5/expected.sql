SELECT category,
       count(*) AS products,
       count(*) FILTER (WHERE name ~* '^[aeiou]') AS vowel_start
FROM products
GROUP BY category
ORDER BY category;
