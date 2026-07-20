## Hint 1
The README's "shape of the file" block is nearly the whole answer: BEGIN,
the 600 debit from Alice, the marker line (copied exactly, including the
leading `--`), then ROLLBACK. The credit and COMMIT never get a chance
to exist - the injected crash sees to that.

## Hint 2
```sql
BEGIN;
UPDATE accounts SET balance = balance - 600 WHERE id = 1;
-- INJECT FAILURE HERE
ROLLBACK;
```

Run it and read the gate's assertions as they pass: the debit really did
execute, and the rollback really did erase it.
