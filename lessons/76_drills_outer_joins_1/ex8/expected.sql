SELECT p.id, p.name,
       count(DISTINCT oi.id) AS big_lines,
       count(DISTINCT r.id) AS recent_one_star
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.quantity = 5
LEFT JOIN reviews r ON r.product_id = p.id
     AND r.rating = 1
     AND r.created_at >= '2023-11-01'
WHERE p.category = 'toys' AND p.price > 495
GROUP BY p.id, p.name
ORDER BY p.id;
