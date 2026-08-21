# Reading - 22_upsert

"Insert it, unless it is already there, in which case update it" sounds
like control flow and is actually a concurrency problem. `ON CONFLICT`
is how PostgreSQL lets you hand that problem to the machinery that is
already solving it.

## Notes

**Why the naive version is broken.** `SELECT` to check, then `INSERT` or
`UPDATE`, is a *check-then-act* race. Two connections can both find nothing,
both insert, and one gets a unique-violation — or, without a unique
constraint, both succeed and you have silently created a duplicate. No
amount of application-level care fixes this; the window between the check
and the act is real and cannot be closed from outside the database.

**The constraint is the mechanism.** `ON CONFLICT (product_id)` requires a
unique index or constraint on `product_id` — PostgreSQL uses the index's own
conflict detection, which is atomic by construction. No constraint, no
upsert. That is worth stating plainly because it reframes Part 4: the
constraints you are about to learn to design are not paperwork, they are the
things that make correct concurrent writes expressible at all.

**`EXCLUDED` is the row that tried.** Inside `DO UPDATE`, the existing row is
addressed by table name (`inventory.stock`) and the proposed row by
`EXCLUDED.stock`. `SET stock = EXCLUDED.stock` overwrites; `SET stock =
inventory.stock + EXCLUDED.stock` accumulates.

**Idempotency is a design decision, and usually the right one.** Run the
statement twice: overwrite is a no-op the second time, accumulate doubles
the value. Now recall that network requests time out and get retried, that
message queues deliver at-least-once, and that every deploy pipeline
eventually runs the same job twice. An accumulating upsert is a correctness
bug waiting for an infrastructure hiccup. When you genuinely need to
accumulate, carry an idempotency key — a per-event unique id whose
constraint absorbs the duplicate — rather than making the arithmetic
depend on how many times the statement ran. Every gate in this lesson runs
your statement twice for exactly this reason.

**`DO NOTHING` versus `DO UPDATE`.** `DO NOTHING` swallows the conflict
silently — right for "register this if absent", wrong when you wanted to
know. Note that `DO NOTHING` without a conflict target swallows *any*
constraint violation on that insert, not just the one you had in mind, which
is occasionally a nasty surprise.

**`DO UPDATE ... WHERE`.** The conditional upsert: update only when some
predicate over the old and new rows holds. "Keep the lowest price ever
seen", "only move a status forward", "ignore stale timestamps" are all this
shape, and all of them are also idempotent, which is not a coincidence — a
condition that is false once the update has been applied *is* what makes a
statement self-limiting.

**What it does not solve.** `ON CONFLICT` handles a conflict on **one**
arbiter index. It cannot express "update if this unique key matches, else
insert unless that other unique key matches". It also takes a row-level lock
on the conflicting row, so a busy upsert on the same key serialises — which
is correct, and worth knowing when it shows up as contention.

**`MERGE` exists too.** PostgreSQL 15 added the SQL-standard `MERGE`, which
is more general (multiple `WHEN` branches, `DELETE` actions) and, unlike `ON
CONFLICT`, does *not* have the same concurrency guarantee — it can raise a
serialisation failure under concurrent writes. For plain insert-or-update on
a unique key, `ON CONFLICT` remains the right tool.

## ex1 — the stocktake sync

Overwrite semantics, one existing row and one new one. The gate runs it
twice; if you wrote `stock = inventory.stock + EXCLUDED.stock` you will
watch idempotency fail in front of you, which is a better lesson than this
paragraph.

Notice what the single statement did *not* require you to know: which of the
two products already had a row. That is the entire value proposition. The
application does not query first, does not branch, and does not care — the
unique index answers the question at the moment of the write, which is the
only moment at which the answer is reliable.

## ex2 — register if absent

`DO NOTHING`. Note what the gate checks: that product 60 is *unchanged*, not
merely present. "Ensure a row exists" and "ensure a row has these values"
are different requirements and it is easy to write the second when you meant
the first.

## ex3 — only update when it is an improvement

The conditional upsert, and the cleanest illustration of why conditional
upserts tend to be idempotent for free: once the best value has been stored,
the condition that allowed the update is false. Monotonic rules — highest
seen, lowest seen, latest timestamp — are safe to retry by construction.

## ex4 — upserting a whole set at once

`INSERT ... SELECT ... ON CONFLICT`. This is the production shape: pull the
source of truth, upsert the whole batch, and let the unique index decide
which rows were new. One statement, one transaction, correct under
concurrency, and it does not care how the two sets overlap.

One caveat worth knowing before you use this on real data: if the *source*
query can produce two rows with the same key, the statement fails with
"cannot affect row a second time" — `ON CONFLICT` resolves conflicts against
the table, not within the incoming batch. Deduplicate the source first,
usually with `DISTINCT ON` (lesson 49).

## challenge — conditional upsert

`price_watch` keeps the lowest price ever seen, which is the monotonic rule
from ex3 pointing the other way. Three products, three different outcomes —
update, no-op, insert — from one statement. That is the whole argument for
upsert in one line: the branching happens inside the database, where the
uniqueness question is already being decided.

## Further reading

- [`INSERT ... ON CONFLICT`](https://www.postgresql.org/docs/16/sql-insert.html) — the conflict target rules, `EXCLUDED`, and the notes on which index gets used as the arbiter.
- [`MERGE`](https://www.postgresql.org/docs/16/sql-merge.html) — the SQL-standard alternative from PostgreSQL 15, with its concurrency caveat spelled out.
- [Unique Constraints](https://www.postgresql.org/docs/16/ddl-constraints.html) — the constraint that makes upsert possible. Lesson 25 designs them.
- [Transaction Isolation](https://www.postgresql.org/docs/16/transaction-iso.html) — what "atomically" actually means here, and what else races look like. Lesson 23 next.
