## Hint 1
Four statements in one file: BEGIN, debit UPDATE (id 1), credit UPDATE
(id 2), COMMIT. `balance = balance - 250` is the debit's SET.

## Hint 2
```sql
BEGIN;
UPDATE accounts SET balance = balance - 250 WHERE id = 1;
UPDATE accounts SET balance = balance + 250 WHERE id = 2;
COMMIT;
```
