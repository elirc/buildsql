WITH per_category AS (
    SELECT category, count(*) AS products
    FROM products
    GROUP BY category
)
SELECT category, products,
       sum(products) OVER (ORDER BY products DESC, category) AS running_products
FROM per_category
ORDER BY products DESC, category;
