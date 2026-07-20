CREATE TABLE giftcard_redemptions (
  id          int           PRIMARY KEY,
  giftcard_id int           NOT NULL REFERENCES giftcards(id) ON DELETE CASCADE,
  amount      numeric(10,2) NOT NULL CHECK (amount > 0)
);
