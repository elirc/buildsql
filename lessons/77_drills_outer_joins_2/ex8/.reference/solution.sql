WITH s AS (
    SELECT oi.product_id, sum(oi.quantity) AS units
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= DATE '2023-11-13'
    GROUP BY oi.product_id
), r AS (
    SELECT product_id, count(*) AS praises
    FROM reviews
    WHERE rating = 5 AND created_at >= DATE '2023-11-13'
    GROUP BY product_id
), ids AS (
    SELECT product_id FROM s
    UNION
    SELECT product_id FROM r
)
SELECT i.product_id,
       coalesce(s.units, 0) AS units,
       coalesce(r.praises, 0) AS praises,
       CASE WHEN s.product_id IS NOT NULL AND r.product_id IS NOT NULL THEN 'both'
            WHEN s.product_id IS NOT NULL THEN 'sales only'
            ELSE 'praise only' END AS bucket
FROM ids i
LEFT JOIN s ON s.product_id = i.product_id
LEFT JOIN r ON r.product_id = i.product_id
ORDER BY i.product_id;
