SELECT count(*) AS lines,
       sum(quantity) AS units,
       round(sum(quantity * price), 2) AS revenue
FROM order_items
WHERE product_id <= 100;
