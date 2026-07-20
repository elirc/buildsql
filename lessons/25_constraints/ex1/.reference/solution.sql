CREATE TABLE giftcards (
  id        int           PRIMARY KEY,
  code      text          NOT NULL UNIQUE,
  balance   numeric(10,2) NOT NULL CHECK (balance >= 0),
  issued_on date          NOT NULL DEFAULT '2023-11-14'
);
