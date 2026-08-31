SELECT round(sum(quantity * price) / sum(quantity), 4) AS weighted_unit_price,
       round(avg(price), 4) AS plain_avg_price,
       sum(quantity) AS units
FROM order_items
WHERE product_id <= 500;
