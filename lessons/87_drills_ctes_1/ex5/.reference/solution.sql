SELECT country, customers, orders, orders_per_customer
FROM (
    SELECT r.country, r.customers, r.orders, r.orders_per_customer,
           avg(r.orders_per_customer) OVER () AS mean_per_customer
    FROM (
        SELECT p.country, p.customers, o.orders,
               round(o.orders::numeric / p.customers, 3) AS orders_per_customer
        FROM (SELECT country, count(*) AS customers
              FROM customers GROUP BY country) p
        JOIN (SELECT c.country, count(*) AS orders
              FROM orders o
              JOIN customers c ON c.id = o.customer_id
              GROUP BY c.country) o ON o.country = p.country
    ) r
) t
WHERE orders_per_customer > mean_per_customer
ORDER BY orders_per_customer DESC, country;
