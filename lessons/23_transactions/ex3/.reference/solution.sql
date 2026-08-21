BEGIN;

UPDATE accounts SET balance = balance - 500.00 WHERE id = 1;
UPDATE accounts SET balance = balance + 500.00 WHERE id = 3;

ROLLBACK;
