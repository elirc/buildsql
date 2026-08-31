WITH lines AS (
    SELECT c.country, p.id AS product_id, p.name AS product_name,
           oi.quantity AS q, oi.quantity * oi.price AS rev, o.id AS order_id
    FROM customers c
    JOIN orders o ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= DATE '2023-11-01'
), ranked AS (
    SELECT country, product_name,
           row_number() OVER (PARTITION BY country
                              ORDER BY sum(q) DESC, product_id) AS rn
    FROM lines
    GROUP BY country, product_id, product_name
)
SELECT t.country, t.revenue, t.units, t.orders, ranked.product_name AS top_product
FROM (SELECT country, sum(rev) AS revenue, sum(q) AS units,
             count(DISTINCT order_id) AS orders
      FROM lines
      GROUP BY country) t
JOIN ranked ON ranked.country = t.country AND ranked.rn = 1
ORDER BY t.revenue DESC, t.country;
