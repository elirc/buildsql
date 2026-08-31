SELECT round(sum(quantity * price), 2) AS revenue,
       round(sum(quantity * price) FILTER (WHERE quantity = 1), 2) AS single_unit_revenue,
       round(100.0 * sum(quantity * price) FILTER (WHERE quantity = 1)
             / sum(quantity * price), 2) AS single_unit_pct
FROM order_items
WHERE product_id <= 200;
