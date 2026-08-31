SELECT category,
       count(*) AS products,
       count(CASE WHEN lower(name) ~ '^[aeiou]' THEN 1 END) AS vowel_start
FROM products
GROUP BY 1
ORDER BY 1;
