-- The deliberately awful table. One row per (order, product) with every
-- fact about the customer and product repeated on every row.
CREATE TABLE flat_orders AS
SELECT o.id                       AS order_id,
       c.name                     AS customer_name,
       c.email                    AS customer_email,
       c.country                  AS customer_country,
       p.name                     AS product_name,
       p.category                 AS product_category,
       sum(oi.quantity)           AS quantity,
       min(oi.price)              AS unit_price
FROM orders o
JOIN customers c    ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.id <= 2000
GROUP BY o.id, c.name, c.email, c.country, p.name, p.category;
