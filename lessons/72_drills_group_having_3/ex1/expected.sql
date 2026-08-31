SELECT order_id, count(*) AS lines
FROM order_items
WHERE order_id <= 3000
GROUP BY order_id
HAVING count(*) = 1
ORDER BY order_id;
