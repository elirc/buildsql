WITH per_category AS (
    SELECT category, count(*) AS products
    FROM products
    GROUP BY category
)
SELECT category, products, rank() OVER (ORDER BY products DESC) AS rnk
FROM per_category
ORDER BY rnk, category;
