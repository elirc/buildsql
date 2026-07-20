## Hint 1
The FK clause reads: `giftcard_id int NOT NULL REFERENCES giftcards(id)
ON DELETE CASCADE`. The CHECK is `amount > 0` — strictly greater; the
gate probes with exactly 0.

## Hint 2
```sql
CREATE TABLE giftcard_redemptions (
  id          int           PRIMARY KEY,
  giftcard_id int           NOT NULL REFERENCES giftcards(id) ON DELETE CASCADE,
  amount      numeric(10,2) NOT NULL CHECK (amount > 0)
);
```
