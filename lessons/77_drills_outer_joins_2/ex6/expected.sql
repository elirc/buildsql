SELECT p.category,
       count(*) AS products,
       count(*) FILTER (WHERE s.product_id IS NULL) AS never_ordered
FROM products p
LEFT JOIN (SELECT DISTINCT product_id FROM order_items) s
       ON s.product_id = p.id
GROUP BY p.category
ORDER BY p.category;
