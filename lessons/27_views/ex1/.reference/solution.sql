CREATE VIEW customer_spend AS
SELECT c.id AS customer_id, c.name,
       coalesce(sum(o.total) FILTER (WHERE o.status IN ('paid', 'shipped')),
                0) AS spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
