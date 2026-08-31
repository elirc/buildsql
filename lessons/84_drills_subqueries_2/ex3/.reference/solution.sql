WITH avgs AS (
    SELECT category, avg(price) AS avg_price
    FROM products
    GROUP BY category
)
SELECT a.category,
       round(a.avg_price, 2) AS avg_price,
       count(*) FILTER (WHERE p.price > a.avg_price) AS above_average
FROM avgs a
JOIN products p ON p.category = a.category
GROUP BY a.category, a.avg_price
ORDER BY a.category;
