WITH per_country AS (
    SELECT country, count(*) AS customers
    FROM customers
    GROUP BY country
), orders_by_country AS (
    SELECT c.country, count(*) AS orders
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    GROUP BY c.country
), rated AS (
    SELECT p.country, p.customers, o.orders,
           round(o.orders::numeric / p.customers, 3) AS orders_per_customer
    FROM per_country p
    JOIN orders_by_country o ON o.country = p.country
)
SELECT country, customers, orders, orders_per_customer
FROM rated
WHERE orders_per_customer > (SELECT avg(orders_per_customer) FROM rated)
ORDER BY orders_per_customer DESC, country;
