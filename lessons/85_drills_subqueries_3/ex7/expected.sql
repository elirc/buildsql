WITH per_customer AS (
    SELECT c.country, o.customer_id, count(*) AS orders
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    GROUP BY c.country, o.customer_id
)
SELECT k.country,
       count(*) AS buyers,
       round(avg(k.orders), 2) AS avg_orders,
       (SELECT count(*) FROM per_customer p
        WHERE p.country = k.country
          AND p.orders > (SELECT avg(q.orders) FROM per_customer q
                          WHERE q.country = k.country)) AS above_own_average
FROM per_customer k
GROUP BY k.country
ORDER BY k.country;
