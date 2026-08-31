SELECT customer_id, count(*) AS orders, sum(total) AS revenue
FROM orders
WHERE status <> 'cancelled'
GROUP BY customer_id
HAVING count(*) >= 15
ORDER BY sum(total) DESC, customer_id;
