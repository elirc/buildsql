SELECT round(sum(quantity * price), 2) AS revenue,
       round(sum(CASE WHEN quantity = 1 THEN quantity * price ELSE 0 END), 2) AS single_unit_revenue,
       round(100.0 * sum(CASE WHEN quantity = 1 THEN quantity * price ELSE 0 END)
             / sum(quantity * price), 2) AS single_unit_pct
FROM order_items
WHERE product_id <= 200;
