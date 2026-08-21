WITH cust AS (
    SELECT country, count(*) AS customers
    FROM customers
    GROUP BY country
), rev AS (
    SELECT c.country, sum(o.total) AS revenue
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    GROUP BY c.country
)
SELECT cust.country, cust.customers, rev.revenue
FROM cust
JOIN rev ON rev.country = cust.country;
