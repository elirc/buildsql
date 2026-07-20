ALTER TABLE orders
  ADD CONSTRAINT orders_total_min CHECK (total >= 5) NOT VALID;

ALTER TABLE orders VALIDATE CONSTRAINT orders_total_min;
