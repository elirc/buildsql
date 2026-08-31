SELECT category,
       count(*) AS products,
       rank() OVER (ORDER BY count(*) DESC) AS rnk
FROM products
GROUP BY category
ORDER BY rnk, category;
