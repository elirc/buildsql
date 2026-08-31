WITH ranked AS (
    SELECT category, id, name, price,
           rank() OVER (ORDER BY price DESC, id) AS overall_rank
    FROM products
), per_category AS (
    SELECT category, id, name, price, overall_rank,
           rank() OVER (PARTITION BY category ORDER BY overall_rank) AS category_rank
    FROM ranked
)
SELECT category, id, name, price, category_rank, overall_rank
FROM per_category
WHERE category_rank <= 3
ORDER BY category, category_rank;
