# Reading - 23_transactions

A transaction is the database's promise that a group of statements becomes
visible all together or not at all. Everything else in this lesson — the
aborted state, savepoints, isolation levels — is a consequence of taking
that promise seriously under concurrency and failure.

## Notes

**ACID, in one line each.** *Atomicity*: all or nothing. *Consistency*: the
database's own rules (constraints, foreign keys) hold at every commit.
*Isolation*: concurrent transactions do not see each other's half-finished
work. *Durability*: once `COMMIT` returns, the change survives a crash.
PostgreSQL gives you all four; the interesting engineering is in what
"isolation" means precisely, and in what *your* code puts inside the
boundary.

**The aborted state is not a bug.** After any error inside a transaction,
PostgreSQL refuses every further statement with `current transaction is
aborted`. This is deliberate: continuing after a failed statement would let
you commit a half-applied change while believing everything worked. The only
statements accepted are `ROLLBACK` and `ROLLBACK TO SAVEPOINT`. Error
handling is therefore part of the transaction's *design*, not plumbing to be
bolted on.

**Savepoints are partial undo.** `SAVEPOINT name` marks a point;
`ROLLBACK TO SAVEPOINT name` discards everything after it *and* clears the
aborted state, leaving the transaction alive and the earlier work intact.
This is how a batch job skips one bad record without losing the batch, and
how psql's `ON_ERROR_ROLLBACK` works. It is not free — each savepoint
consumes a subtransaction id, and tens of thousands of them in one
transaction is a known performance cliff — but at batch granularity it is
exactly the right tool.

**DDL is transactional in PostgreSQL.** `CREATE TABLE`, `ALTER TABLE`,
`CREATE INDEX` (without `CONCURRENTLY`), even `DROP TABLE` — all roll back.
A migration that creates a table, backfills it, adds constraints and fails
halfway leaves *nothing* behind. MySQL and Oracle cannot do this, and
migration tooling in those ecosystems is shaped around the absence. Cherish
it; Part 4 leans on it heavily.

**Isolation levels, briefly.** PostgreSQL's default is `READ COMMITTED`:
each statement sees a snapshot taken at the moment that statement started.
So two statements in one transaction can see different data, and a
read-modify-write across two statements can lose an update. `REPEATABLE
READ` takes one snapshot for the whole transaction. `SERIALIZABLE` goes
further and guarantees the outcome equals *some* serial order of the
concurrent transactions — at the cost of transactions that fail with a
serialisation error and must be retried by the application. The practical
rule: if your logic reads a value, decides, then writes based on that
decision, `READ COMMITTED` is not enough on its own — use `SELECT ... FOR
UPDATE`, a unique constraint with `ON CONFLICT` (lesson 22), or
`SERIALIZABLE` with retry.

**Long transactions are expensive in a way that is not obvious.**
PostgreSQL's MVCC keeps old row versions alive as long as any transaction
might still need to see them. A transaction left open for an hour prevents
`VACUUM` from reclaiming *anything* newer than its snapshot, across the whole
database — bloating tables that transaction never touched. "Open a
transaction, then go and call an HTTP API" is the canonical way to cause
this. Lesson 44 is where it bites.

**The boundary is a design problem.** In application code transactions hide
inside a `with db.begin():` block, and the classic production bug is work
that escapes it in either direction: an HTTP call, a queue publish, a cache
invalidation *inside* the transaction (those do not roll back), or a commit
that lands while business invariants are still half-applied. Whenever you
touch transactional code, draw the boundary and ask two questions: what is
inside that cannot roll back, and what is outside that should be inside?
The outbox and saga patterns exist because the answers get hard at scale.

## ex1 — the classic transfer

Two updates, one atomic unit. The gate checks the sum as well as the
balances, because the invariant that actually matters is not "Alice has 650"
but "money is neither created nor destroyed". Write the invariant check
alongside the migration; it is the assertion that catches the bug you did
not think of.

## ex2 — survive a mid-flight crash

Atomicity demonstrated on your own script. The debit was really applied —
it was visible inside the transaction — and then it evaporated. Nothing in
the table, no log line, no compensating update. That is the guarantee you
are buying, and it is why "just be careful in application code" is not an
alternative.

## ex3 — changing your mind

`ROLLBACK` as a deliberate choice rather than an error path. The habit this
is really teaching: `BEGIN`, do the dangerous thing, `SELECT` to inspect the
result, and *then* decide. In psql this makes an `UPDATE` with a suspicious
`WHERE` completely safe to try. It is the professional ritual from lesson 21
with the safety catch actually engaged.

## ex4 — recovering without giving up

The difference between ex2 and ex4 is the difference between a job that dies
and a job that skips a record. Note precisely what survived: the escrow
transfer, which happened *before* the savepoint. Everything after it was
discarded, the transaction was restored to a usable state, and the later
work committed normally. Batch importers, migration scripts and
message-queue consumers are all built on this shape.

## Further reading

- [Transactions](https://www.postgresql.org/docs/16/tutorial-transactions.html) — the tutorial chapter, including savepoints. Short and worth reading start to finish.
- [Transaction Isolation](https://www.postgresql.org/docs/16/transaction-iso.html) — read-committed, repeatable-read and serializable, with the anomalies each one permits. The most important page in this lesson.
- [`SAVEPOINT`](https://www.postgresql.org/docs/16/sql-savepoint.html) — the reference page, plus `RELEASE SAVEPOINT` which you will want for long loops.
- [Explicit Locking](https://www.postgresql.org/docs/16/explicit-locking.html) — `SELECT ... FOR UPDATE` and friends, for when read-then-write must not race.
