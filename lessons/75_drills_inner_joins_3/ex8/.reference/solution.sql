WITH jp AS (
    SELECT oi.product_id,
           count(DISTINCT o.customer_id) AS buyers,
           sum(oi.quantity) AS units
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    JOIN order_items oi ON oi.order_id = o.id
    WHERE c.country = 'JP'
      AND o.created_at >= '2023-10-01'
      AND o.created_at <  '2023-11-01'
    GROUP BY oi.product_id
), rv AS (
    SELECT product_id, count(*) AS reviews
    FROM reviews
    GROUP BY product_id
)
SELECT p.id, p.name, jp.buyers, jp.units, rv.reviews
FROM products p
JOIN jp ON jp.product_id = p.id
JOIN rv ON rv.product_id = p.id
WHERE p.category = 'electronics'
  AND jp.buyers >= 2
ORDER BY jp.units DESC, p.id;
