WITH customers_per_country AS (
    SELECT country, count(*) AS customers
    FROM customers
    GROUP BY country
), revenue_per_country AS (
    SELECT c.country, sum(o.total) AS revenue
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    GROUP BY c.country
)
SELECT cpc.country, cpc.customers, rpc.revenue
FROM customers_per_country cpc
JOIN revenue_per_country rpc ON rpc.country = cpc.country;
