WITH per_pair AS (
    SELECT c.country, o.status, count(*) AS orders
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    GROUP BY c.country, o.status
), per_country AS (
    SELECT country, sum(orders) AS orders
    FROM per_pair
    GROUP BY country
)
SELECT p.country, p.status, p.orders,
       round(100.0 * p.orders / k.orders, 2) AS pct_of_country
FROM per_pair p
JOIN per_country k ON k.country = p.country
ORDER BY p.country, p.status;
