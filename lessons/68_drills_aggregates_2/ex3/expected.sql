SELECT sum(quantity) AS units,
       round(sum(quantity * price), 2) AS revenue,
       round(avg(quantity * price), 2) AS avg_line
FROM order_items
WHERE order_id <= 2000;
