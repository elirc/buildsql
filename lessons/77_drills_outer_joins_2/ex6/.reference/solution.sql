SELECT p.category,
       count(*) AS products,
       count(*) - count(s.product_id) AS never_ordered
FROM products p
LEFT JOIN (SELECT product_id FROM order_items GROUP BY product_id) s
       ON s.product_id = p.id
GROUP BY p.category
ORDER BY p.category;
