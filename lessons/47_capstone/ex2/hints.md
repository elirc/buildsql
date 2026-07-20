## Hint 1
Lesson 28's two recipes back to back: (add column -> backfill -> SET
NOT NULL), then (ADD CONSTRAINT ... CHECK (channel IN (...)) NOT VALID
-> VALIDATE CONSTRAINT). Name the constraint exactly as the prompt
says.

## Hint 2
```sql
ALTER TABLE orders ADD COLUMN channel text;
UPDATE orders SET channel = 'web';
ALTER TABLE orders ALTER COLUMN channel SET NOT NULL;
ALTER TABLE orders ADD CONSTRAINT orders_channel_ck
  CHECK (channel IN ('web', 'mobile', 'phone')) NOT VALID;
ALTER TABLE orders VALIDATE CONSTRAINT orders_channel_ck;
```
