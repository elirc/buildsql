WITH per_pair AS (
    SELECT floor(price / 100) * 100 AS band, category, count(*) AS products
    FROM products
    GROUP BY 1, 2
), per_band AS (
    SELECT band, sum(products) AS products
    FROM per_pair
    GROUP BY band
)
SELECT p.band, p.category, p.products,
       round(100.0 * p.products / b.products, 2) AS pct_of_band
FROM per_pair p
JOIN per_band b ON b.band = p.band
ORDER BY p.band, p.category;
