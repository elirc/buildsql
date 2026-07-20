## Hint 1
This is lesson 25's giftcards exercise scaled up: two CREATE TABLEs,
parents first. Walk the prose and convert each phrase: "unique printed
code" -> NOT NULL UNIQUE; "never negative" -> CHECK; "tied to a real
order" -> FK to orders; "positive amount" -> CHECK (amount > 0).

## Hint 2
```sql
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
```

(The CASCADE and issued_on are choices, not requirements - defend yours.)
