WITH lines AS (
    SELECT c.country,
           p.id AS product_id,
           p.name AS product_name,
           oi.quantity AS q,
           oi.quantity * oi.price AS rev,
           o.id AS order_id
    FROM customers c
    JOIN orders o ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= '2023-11-01'
), totals AS (
    SELECT country,
           sum(rev) AS revenue,
           sum(q) AS units,
           count(DISTINCT order_id) AS orders
    FROM lines
    GROUP BY country
), best AS (
    SELECT DISTINCT ON (country) country, product_name
    FROM (SELECT country, product_id, product_name, sum(q) AS units
          FROM lines
          GROUP BY country, product_id, product_name) z
    ORDER BY country, units DESC, product_id
)
SELECT t.country, t.revenue, t.units, t.orders, b.product_name AS top_product
FROM totals t
JOIN best b ON b.country = t.country
ORDER BY t.revenue DESC, t.country;
