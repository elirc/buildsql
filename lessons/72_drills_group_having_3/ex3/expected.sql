SELECT customer_id, count(*) AS paid_orders, round(sum(total), 2) AS paid_revenue
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING sum(total) > 15000
ORDER BY customer_id;
