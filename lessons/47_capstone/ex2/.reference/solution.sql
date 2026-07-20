ALTER TABLE orders ADD COLUMN channel text;

UPDATE orders SET channel = 'web';

ALTER TABLE orders ALTER COLUMN channel SET NOT NULL;

ALTER TABLE orders ADD CONSTRAINT orders_channel_ck
  CHECK (channel IN ('web', 'mobile', 'phone')) NOT VALID;

ALTER TABLE orders VALIDATE CONSTRAINT orders_channel_ck;
