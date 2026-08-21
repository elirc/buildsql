-- Provided — do not edit.
CREATE INDEX orders_created_at_idx ON orders (created_at);
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
CREATE INDEX customers_email_idx ON customers (email);
