SELECT customer_id, count(*) FROM orders
GROUP BY customer_id HAVING count(*) > 20;
