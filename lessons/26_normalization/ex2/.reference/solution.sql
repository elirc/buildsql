INSERT INTO n_customers (email, name, country)
SELECT DISTINCT customer_email, customer_name, customer_country
FROM flat_orders;

INSERT INTO n_orders (order_id, customer_email)
SELECT DISTINCT order_id, customer_email
FROM flat_orders;

INSERT INTO n_lines (order_id, product_name, category, quantity, unit_price)
SELECT order_id, product_name, product_category, quantity, unit_price
FROM flat_orders;
