WITH per_customer AS (
    SELECT c.country, o.customer_id, count(*) AS orders
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    GROUP BY c.country, o.customer_id
), country_avg AS (
    SELECT country, avg(orders) AS avg_orders
    FROM per_customer
    GROUP BY country
)
SELECT k.country,
       count(*) AS buyers,
       round(avg(k.orders), 2) AS avg_orders,
       count(*) FILTER (WHERE k.orders > a.avg_orders) AS above_own_average
FROM per_customer k
JOIN country_avg a ON a.country = k.country
GROUP BY k.country, a.avg_orders
ORDER BY k.country;
