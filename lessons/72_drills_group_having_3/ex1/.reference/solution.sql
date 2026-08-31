SELECT order_id, count(*) AS lines
FROM order_items
WHERE order_id <= 3000
GROUP BY order_id
HAVING count(order_id) < 2
ORDER BY order_id;
