CREATE TABLE accounts (
  id      int PRIMARY KEY,
  owner   text NOT NULL,
  balance numeric(10,2) NOT NULL CHECK (balance >= 0)
);

INSERT INTO accounts (id, owner, balance) VALUES
  (1, 'Alice', 900.00),
  (2, 'Bob',   100.00),
  (3, 'Escrow',  0.00);
