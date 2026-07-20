BEGIN;
UPDATE accounts SET balance = balance - 600 WHERE id = 1;
-- INJECT FAILURE HERE
ROLLBACK;
