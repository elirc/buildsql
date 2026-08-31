SELECT count(id) AS lines,
       sum(quantity) AS units,
       round(sum(price * quantity), 2) AS revenue
FROM order_items
WHERE product_id <= 100;
