# 23 — Transactions

Move 250 from Alice to Bob: one UPDATE subtracts, another adds. Now
imagine the process dies *between* them — the money is simply gone, and
no log line will ever tell you where. The transaction is the database's
answer: a group of statements that becomes visible **all together or not
at all**.

`setup.sql` gives this lesson an `accounts` table: Alice 900, Bob 100,
Escrow 0, with a CHECK forbidding negative balances. The gates run your
script over an autocommit connection — meaning **your** `BEGIN` /
`COMMIT` / `ROLLBACK` statements are the only transaction control there
is, exactly like typing into psql.

## Concept

```sql
BEGIN;
UPDATE accounts SET balance = balance - 250 WHERE id = 1;
UPDATE accounts SET balance = balance + 250 WHERE id = 2;
COMMIT;
```

- Between `BEGIN` and `COMMIT`, your changes are invisible to everyone
  else and reversible by you. `ROLLBACK` abandons them entirely.
- **After any error inside a transaction, PostgreSQL refuses every
  further statement until you ROLLBACK** (`current transaction is
  aborted...`). Error handling isn't optional plumbing; it's part of the
  transaction's design.
- `SAVEPOINT name` / `ROLLBACK TO SAVEPOINT name` gives partial undo
  *inside* a transaction — how batch jobs skip one bad record without
  abandoning the batch. (The dojo's own constraint probes in Part 4 use
  savepoints — you'll see them from the other side.)
- A famous PostgreSQL superpower: **DDL is transactional**. A migration
  that creates a table, backfills it, and adds constraints can roll back
  as a unit. Not true in MySQL and Oracle; cherish it. (Part 4 builds on
  this.)

## Exercise 1 — the classic transfer

Edit `ex1/solution.sql`. Write the complete transaction transferring
**250.00 from Alice (id 1) to Bob (id 2)**: `BEGIN`, the two UPDATEs,
`COMMIT`. The gate verifies both balances and that the total across all
accounts is still 1000.

Run: `uv run dojo test 23_transactions ex1`

## Exercise 2 — survive a mid-flight crash

Edit `ex2/solution.sql`. Same transfer, 600.00 this time — but your
script must contain this exact line between the debit and the rest:

```sql
-- INJECT FAILURE HERE
```

The gate splits your script at that marker, runs the first half, then
**injects a crashing statement** (division by zero), and finally runs
your remainder. At that point the transaction is in the aborted state —
the only statement PostgreSQL will accept is `ROLLBACK`, so your
remainder must issue it. The gate then verifies Alice still has 900 and
Bob 100: the half-done debit evaporated with the rollback. That
evaporation is atomicity, demonstrated on your own script.

Shape of the file:

```sql
BEGIN;
UPDATE ...;            -- the debit
-- INJECT FAILURE HERE
ROLLBACK;              -- your crash recovery
```

Run: `uv run dojo test 23_transactions ex2`

## The gate

```python
"""Gates for 23_transactions. Quoted verbatim in README.md.

These gates run your script on a SEPARATE AUTOCOMMIT connection, so your
own BEGIN/COMMIT/ROLLBACK statements are fully in charge of transaction
boundaries - exactly like a psql session.
"""
import psycopg
import pytest

from dojo import db, grader
from dojo.lesson import Lesson

L = Lesson(__file__)

MARKER = "-- INJECT FAILURE HERE"


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex1")
    with db.connect(lesson_db.info.dbname, autocommit=True) as tx_conn:
        tx_conn.execute(ex.solution_sql)
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 1",
                         650, "Alice: 900 - 250")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 2",
                         350, "Bob: 100 + 250")
    grader.assert_scalar(lesson_db, "SELECT sum(balance) FROM accounts",
                         1000, "money is neither created nor destroyed")


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex2")
    script = ex.solution_sql
    assert MARKER in script, (
        "Your script must contain the literal marker line\n"
        f"    {MARKER}\n"
        "between the debit and your recovery handling - the gate injects a "
        "crash at that point to prove your transaction is atomic."
    )
    first_half, _, remainder = script.partition(MARKER)
    with db.connect(lesson_db.info.dbname, autocommit=True) as tx_conn:
        tx_conn.execute(first_half)
        with pytest.raises(psycopg.Error):
            tx_conn.execute("SELECT 1/0")  # the injected disaster
        try:
            tx_conn.execute(remainder)
        except psycopg.errors.InFailedSqlTransaction:
            raise AssertionError(
                "After the injected failure, the transaction is in a failed "
                "state: the ONLY statement PostgreSQL will accept is ROLLBACK. "
                "Your script's remainder must roll the transaction back."
            ) from None
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 1",
                         900, "Alice untouched - the half-done debit must vanish")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 2",
                         100, "Bob untouched")
```

## The teaching point

In application code, transactions hide inside `with db.begin():` blocks
— and the classic production bug is *work that escapes the block*:
an HTTP call, a queue publish, a cache write inside the transaction
(they don't roll back!), or a commit that happens while business
invariants are still half-applied. Whenever you touch transactional
code, draw the boundary and ask two questions: what's inside that can't
roll back, and what's outside that should be inside? Entire architecture
patterns (outbox, saga) exist to answer them at scale.

Next: **Part 4** — you stop querying tables and start designing them:
**24_ddl_and_types**.
