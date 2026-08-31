WITH sel AS (
    SELECT id, name FROM products
    WHERE category = 'electronics' AND price > 495
)
SELECT sel.id, sel.name,
       coalesce(s.units, 0) AS units,
       coalesce(r.reviews, 0) AS reviews,
       r.avg_rating
FROM sel
LEFT JOIN (SELECT oi.product_id, sum(oi.quantity) AS units
           FROM order_items oi
           WHERE oi.product_id IN (SELECT id FROM sel)
           GROUP BY oi.product_id) s ON s.product_id = sel.id
LEFT JOIN (SELECT rv.product_id, count(*) AS reviews,
                  round(avg(rv.rating), 2) AS avg_rating
           FROM reviews rv
           WHERE rv.product_id IN (SELECT id FROM sel)
           GROUP BY rv.product_id) r ON r.product_id = sel.id
ORDER BY sel.id;
