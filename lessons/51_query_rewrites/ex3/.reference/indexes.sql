-- Provided — do not edit. Three perfectly good indexes, all unusable
-- by the query as written.
CREATE INDEX orders_total_idx ON orders (total);
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
CREATE INDEX customers_email_idx ON customers (email);
