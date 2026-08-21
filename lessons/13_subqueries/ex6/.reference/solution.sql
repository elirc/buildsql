SELECT customer_id, revenue
FROM (
    SELECT customer_id, sum(total) AS revenue
    FROM orders
    WHERE status IN ('paid', 'shipped')
    GROUP BY customer_id
) AS per_customer
WHERE revenue > 20000;
