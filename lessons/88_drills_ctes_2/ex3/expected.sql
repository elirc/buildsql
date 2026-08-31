WITH per_customer AS (
    SELECT customer_id, count(*) AS orders
    FROM orders
    GROUP BY customer_id
), with_country AS (
    SELECT c.country, pc.orders
    FROM per_customer pc
    JOIN customers c ON c.id = pc.customer_id
)
SELECT country,
       count(*) AS buyers,
       round(avg(orders), 2) AS avg_orders,
       max(orders) AS max_orders
FROM with_country
GROUP BY country
ORDER BY country;
