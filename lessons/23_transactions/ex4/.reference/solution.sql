BEGIN;

UPDATE accounts SET balance = balance - 100.00 WHERE id = 1;
UPDATE accounts SET balance = balance + 100.00 WHERE id = 3;

SAVEPOINT batch;
-- INJECT FAILURE HERE
ROLLBACK TO SAVEPOINT batch;

UPDATE accounts SET balance = balance - 50.00 WHERE id = 1;
UPDATE accounts SET balance = balance + 50.00 WHERE id = 2;

COMMIT;
