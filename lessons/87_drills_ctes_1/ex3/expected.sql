WITH per_product AS (
    SELECT product_id, sum(quantity) AS units
    FROM order_items
    GROUP BY product_id
), per_category AS (
    SELECT p.category, sum(u.units) AS units
    FROM per_product u
    JOIN products p ON p.id = u.product_id
    GROUP BY p.category
)
SELECT category, units
FROM per_category
ORDER BY units DESC, category;
