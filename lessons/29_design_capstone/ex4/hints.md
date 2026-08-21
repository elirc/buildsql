## Hint 1
A `CREATE TABLE` for the batches, then an `ALTER TABLE gift_cards ADD
COLUMN batch_id int REFERENCES ... ON DELETE SET NULL;`.

## Hint 2
Leave `batch_id` nullable - `SET NULL` cannot fire on a NOT NULL
column, and the existing cards have no batch anyway.
