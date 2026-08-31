SELECT c.category,
       (SELECT round(avg(price), 2)
        FROM products
        WHERE category = c.category) AS avg_price,
       (SELECT round(avg(r.rating), 2)
        FROM reviews r
        JOIN products p2 ON p2.id = r.product_id
        WHERE p2.category = c.category) AS avg_rating
FROM (SELECT DISTINCT category FROM products) c
ORDER BY c.category;
