WITH per_pair AS (
    SELECT category,
           attributes->>'color' AS color,
           count(*) AS products,
           avg(price) AS avg_price
    FROM products
    GROUP BY 1, 2
), per_category AS (
    SELECT category, sum(products) AS category_products
    FROM per_pair
    GROUP BY category
)
SELECT p.category, p.color, p.products,
       round(p.avg_price, 2) AS avg_price,
       k.category_products
FROM per_pair p
JOIN per_category k ON k.category = p.category
ORDER BY p.category, p.color;
