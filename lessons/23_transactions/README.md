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

## Exercise 3 — changing your mind (ROLLBACK)

Edit `ex3/solution.sql`. Operations started moving **500.00 from Alice (id
1) into Escrow (id 3)** and then discovered the transfer was authorised
against the wrong account. Write the transaction that does the work and
then **abandons it**: `BEGIN`, both `UPDATE`s, `ROLLBACK`.

The gate checks that all three balances are exactly as `setup.sql` left
them — Alice 900, Bob 100, Escrow 0 — and that your script really did open
a transaction and roll it back.

`ROLLBACK` is not error handling here. It is a decision. Between `BEGIN`
and the end of the transaction, your changes are real to you and invisible
to everyone else, which means a transaction is a place to *try things* —
run the update, look at the result with a `SELECT`, and only then decide
whether the world should see it. That is the single most useful habit in
this lesson, and it costs nothing.

Run: `uv run dojo test 23_transactions ex3`

## Exercise 4 — recovering without giving up (SAVEPOINT)

Edit `ex4/solution.sql`. Exercise 2 met a failure and had no choice but to
throw the whole transaction away. A batch job cannot afford that: one bad
record must not cost you the other nine hundred. `SAVEPOINT` is the answer.

Write a transaction that:

1. moves **100.00 from Alice (id 1) to Escrow (id 3)**,
2. takes a `SAVEPOINT`,
3. contains the exact marker line `-- INJECT FAILURE HERE`,
4. **rolls back to the savepoint** — recovering the transaction rather than
   abandoning it,
5. then moves **50.00 from Alice to Bob (id 2)**,
6. and `COMMIT`s.

Final balances: Alice 750, Bob 150, Escrow 100.

The gate splits your file at the marker, runs the first half, injects a
division by zero, then runs your remainder. After the injected error the
transaction is in the aborted state — but `ROLLBACK TO SAVEPOINT` is
accepted there, and it returns the transaction to a working state with the
work done *before* the savepoint still intact. That is the difference
between a batch job that skips a record and one that loses a night.

Shape of the file:

```sql
BEGIN;
UPDATE ...;            -- the 100.00 into escrow
UPDATE ...;
SAVEPOINT batch;
-- INJECT FAILURE HERE
ROLLBACK TO SAVEPOINT batch;
UPDATE ...;            -- the 50.00 to Bob
UPDATE ...;
COMMIT;
```

Run: `uv run dojo test 23_transactions ex4`

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


def test_ex3(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex3")
    script = ex.solution_sql
    lowered = script.lower()
    assert "begin" in lowered and "rollback" in lowered, (
        "This exercise is about ROLLBACK: your script must open a transaction "
        "with BEGIN, do the two UPDATEs, and abandon it with ROLLBACK."
    )
    assert "update" in lowered, (
        "Roll back some actual work - the script needs the two UPDATEs in it."
    )
    with db.connect(lesson_db.info.dbname, autocommit=True) as tx_conn:
        tx_conn.execute(script)
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 1",
                         900, "Alice untouched - the transaction was abandoned")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 3",
                         0, "Escrow untouched")
    grader.assert_scalar(lesson_db, "SELECT sum(balance) FROM accounts",
                         1000, "money is neither created nor destroyed")


def test_ex4(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex4")
    script = ex.solution_sql
    assert MARKER in script, (
        "Your script must contain the literal marker line\n"
        f"    {MARKER}\n"
        "just after your SAVEPOINT - the gate injects a crash there."
    )
    assert "savepoint" in script.lower(), (
        "This exercise is about SAVEPOINT. Without one, the injected failure "
        "poisons the whole transaction and ROLLBACK is your only legal move."
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
                "The transaction is still aborted when your remainder runs its "
                "first statement. ROLLBACK TO SAVEPOINT must come first - it is "
                "the one thing PostgreSQL accepts in a failed transaction "
                "besides ROLLBACK."
            ) from None
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 1",
                         750, "Alice: 900 - 100 (escrow, kept) - 50 (Bob)")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 2",
                         150, "Bob: 100 + 50, the work done AFTER the recovery")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 3",
                         100, "Escrow: the work done BEFORE the savepoint survived")
    grader.assert_scalar(lesson_db, "SELECT sum(balance) FROM accounts",
                         1000, "money is neither created nor destroyed")
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
