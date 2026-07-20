CREATE TABLE gift_cards (
  id              int           PRIMARY KEY,
  code            text          NOT NULL UNIQUE,
  initial_balance numeric(10,2) NOT NULL CHECK (initial_balance >= 0),
  issued_on       date          NOT NULL DEFAULT '2023-11-14'
);

CREATE TABLE gift_card_redemptions (
  id           int           PRIMARY KEY,
  gift_card_id int           NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id     int           NOT NULL REFERENCES orders(id),
  amount       numeric(10,2) NOT NULL CHECK (amount > 0)
);
