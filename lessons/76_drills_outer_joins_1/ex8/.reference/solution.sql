SELECT p.id, p.name, coalesce(b.n, 0), coalesce(w.n, 0)
FROM products p
LEFT JOIN (SELECT product_id, count(*) AS n
           FROM order_items
           WHERE quantity = 5
           GROUP BY product_id) b ON b.product_id = p.id
LEFT JOIN (SELECT product_id, count(*) AS n
           FROM reviews
           WHERE rating = 1 AND created_at >= DATE '2023-11-01'
           GROUP BY product_id) w ON w.product_id = p.id
WHERE p.category = 'toys' AND p.price > 495
ORDER BY p.id;
