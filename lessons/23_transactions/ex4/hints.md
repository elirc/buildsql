## Hint 1
The marker must sit AFTER `SAVEPOINT batch;` and BEFORE
`ROLLBACK TO SAVEPOINT batch;` - the gate injects the failure exactly
there, and your remainder has to recover from it.

## Hint 2
First statement of the remainder must be `ROLLBACK TO SAVEPOINT batch;`
- nothing else is accepted while the transaction is aborted. Then the
two UPDATEs for Bob, then `COMMIT;`.
