CREATE TABLE gift_card_batches (
  id         int  PRIMARY KEY,
  printed_on date NOT NULL
);

ALTER TABLE gift_cards
  ADD COLUMN batch_id int REFERENCES gift_card_batches(id) ON DELETE SET NULL;
