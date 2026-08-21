# Reading - 28_altering_live_schemas

Every schema you will ever change is already in production, already has
data, and already has traffic. `ALTER TABLE` is easy syntax; doing it
without an outage is the skill, and the whole skill reduces to one
question: *what does this statement lock, and for how long?*

## Notes

**The danger is lock duration, not lock strength.** Most `ALTER TABLE`
forms take an `ACCESS EXCLUSIVE` lock, which blocks every reader and
writer. That is fine when the statement is instant — a catalog update takes
microseconds. It is an outage when the statement also has to *scan or
rewrite* the table while holding the lock. So the safe patterns all share
one shape: **split the instant-but-locking step from the slow-but-concurrent
step.**

**Instant (catalog-only) operations:**

- `ADD COLUMN` (nullable, or with a **constant** default since PostgreSQL 11)
- `DROP COLUMN` — logical only; the bytes stay until each row is rewritten
- `RENAME COLUMN` / `RENAME TABLE`
- `ADD CONSTRAINT ... NOT VALID`
- `SET DEFAULT` / `DROP DEFAULT`

**Operations that scan or rewrite:**

- `SET NOT NULL` — scans the whole table to verify (though PostgreSQL 12+
  can skip the scan if an equivalent validated `CHECK` already proves it)
- `ADD CONSTRAINT` without `NOT VALID` — scans to verify
- `ALTER COLUMN TYPE` — usually a full rewrite plus index rebuilds
- `ADD COLUMN ... DEFAULT <volatile expression>` — full rewrite

**The NOT NULL three-step.**

```sql
ALTER TABLE t ADD COLUMN c text;            -- 1. instant
UPDATE t SET c = ...;                       -- 2. no DDL lock, batchable
ALTER TABLE t ALTER COLUMN c SET NOT NULL;  -- 3. one scan, short lock
```

**The NOT VALID two-step.**

```sql
ALTER TABLE orders ADD CONSTRAINT orders_total_min
  CHECK (total >= 5) NOT VALID;             -- 1. polices new rows, instant
ALTER TABLE orders VALIDATE CONSTRAINT orders_total_min;
                                            -- 2. audits old rows, weak lock
```

`NOT VALID` means "trust the past, police the future". `VALIDATE` then
checks the past under a lock that permits reads *and* writes. The classic
half-finished migration is step 1 without step 2 — the constraint exists,
the catalog looks right, and nobody ever confirmed the historical data. This
is exactly why lesson 25's gates test *behaviour* and not just the catalog.

**Two things production migrations add that these exercises do not.** First,
a `lock_timeout`: if your `ALTER` cannot get its lock in two seconds, it
should fail rather than queue — because while it queues, *every* subsequent
query on that table queues behind it, and a five-minute wait becomes a
five-minute outage even though your statement never ran. Second, batching:
a backfill `UPDATE` over ten million rows is one enormous transaction that
bloats the table and holds a snapshot open (lesson 44); real backfills loop
in chunks of a few thousand with a commit between them.

**`CREATE INDEX CONCURRENTLY`.** Building an index normally blocks writes
for the duration. `CONCURRENTLY` does two passes and blocks almost nothing —
at the cost of being slower, unable to run inside a transaction block, and
capable of leaving an `INVALID` index behind if it fails, which you must
drop and retry. On any table that matters, this is the only way to add an
index. Part 5 builds every index without it because the dojo's clones have
no concurrent traffic.

**Expand and contract.** The general pattern for a change that cannot be
atomic — renaming a column that applications read, splitting a table,
changing a type. *Expand*: add the new thing alongside the old, write to
both. *Migrate*: backfill, then switch readers over. *Contract*: stop
writing the old thing, then drop it. Each step is independently safe and
independently reversible, which is what makes the deploy boring. Lesson
26's ex4 was this pattern in miniature.

**DDL is transactional in PostgreSQL** (lesson 23), so a migration script
that fails halfway leaves nothing behind. This is a genuine superpower and
it changes how migrations are written — but note the exceptions: `CREATE
INDEX CONCURRENTLY` and `VACUUM` cannot run inside a transaction block.

## ex1 — the NOT NULL three-step

The three steps, plus a performance lesson hiding inside step 2: two
set-based `UPDATE`s beat a per-row correlated `CASE` by roughly a
thousand-fold, and the gate's runtime will tell you which you wrote. "Set
based, not row based" is the single most valuable instinct to bring from
application programming into SQL.

## ex2 — the NOT VALID two-step

The gate checks `pg_constraint.convalidated`, because a constraint that
exists but was never validated is the classic half-finished migration: it
looks correct in every schema dump and guarantees nothing about the rows
that were already there.

Worth being precise about what each half buys you. After step 1, every new
or updated row is checked — so the problem stops growing immediately, which
is often the urgent part. Step 2 is what lets you *reason* about the table:
until it runs, a query cannot assume the constraint holds, and neither can
you. Splitting an outage-shaped operation into an urgent instant half and a
patient concurrent half is the whole pattern of this lesson.

## ex3 — the column that costs nothing to add

One statement, and the thing to remember is the boundary: constant defaults
are instant, volatile ones rewrite the table. `DEFAULT false` and `DEFAULT
0` are safe on any table size; `DEFAULT now()` and `DEFAULT
gen_random_uuid()` are not, and PostgreSQL will not warn you before it
starts rewriting a hundred gigabytes.

## ex4 — DROP COLUMN does not free the space

The size assertion is the lesson. `DROP COLUMN` is a catalog change; the
data stays in every existing row until that row is rewritten. Two practical
consequences: dropping a column will not resolve a disk-space alert, and the
dropped column still counts against PostgreSQL's 1,600-column-per-table
limit until the table is rewritten. `VACUUM FULL` reclaims the space and
takes an `ACCESS EXCLUSIVE` lock for the duration; `pg_repack` does the same
job without the outage. Lesson 44 covers the vacuum side properly.

## Further reading

- [`ALTER TABLE`](https://www.postgresql.org/docs/16/sql-altertable.html) — the reference page, including the "Notes" section that lists exactly which forms require a rewrite.
- [Explicit Locking — lock modes](https://www.postgresql.org/docs/16/explicit-locking.html) — the conflict matrix. `ACCESS EXCLUSIVE` against everything is the row that matters.
- [`CREATE INDEX CONCURRENTLY`](https://www.postgresql.org/docs/16/sql-createindex.html) — the two-pass build, its restrictions, and what an `INVALID` index means.
- [Routine Vacuuming](https://www.postgresql.org/docs/16/routine-vacuuming.html) — why dropped columns and updated rows keep their space, and what reclaims it. Lesson 44.
