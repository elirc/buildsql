SELECT c.id, c.name,
       greatest(count(o.id), 1) AS rows_returned,
       count(o.id) AS big_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 1900
WHERE c.country = 'CA' AND c.created_at >= DATE '2023-09-01'
GROUP BY c.id, c.name
ORDER BY c.id;
