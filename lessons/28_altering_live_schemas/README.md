# 28 — Altering live schemas

Every schema you'll ever meet is already in production, already has
data, and already has traffic. `ALTER TABLE` is easy; doing it **without
an outage** is the skill. The hidden danger is locking: many ALTERs take
an `ACCESS EXCLUSIVE` lock — every query on the table queues behind you,
and if your ALTER also has to *scan or rewrite* half a gigabyte while
holding that lock, the application is down and pretending otherwise.

The safe patterns all share one idea: **split the instant-but-locking
step from the slow-but-concurrent step.**

## Concept

Cheap and instant (brief lock, no scan — fine to run any time):

```sql
ALTER TABLE customers ADD COLUMN loyalty_tier text;       -- nullable, no default scan*
ALTER TABLE customers RENAME COLUMN x TO y;
ALTER TABLE customers DROP COLUMN old_thing;              -- logical delete only
```

(*since PostgreSQL 11, even ADD COLUMN ... DEFAULT is instant for
constant defaults — the default is stored once, not written per-row.)

**The NOT NULL three-step** — you can't just declare NOT NULL on a
populated nullable column without a full validating scan under lock.
Instead:

```sql
ALTER TABLE t ADD COLUMN c text;         -- 1. add nullable    (instant)
UPDATE t SET c = ... ;                   -- 2. backfill        (set-based, no DDL lock)
ALTER TABLE t ALTER COLUMN c SET NOT NULL;  -- 3. flip         (one scan, short)
```

**The NOT VALID two-step** — same trick for constraints:

```sql
ALTER TABLE orders ADD CONSTRAINT orders_total_min
  CHECK (total >= 5) NOT VALID;          -- 1. enforce for NEW rows (instant)
ALTER TABLE orders VALIDATE CONSTRAINT orders_total_min;
                                         -- 2. scan old rows with a weak lock
```

`NOT VALID` means "trust the past, police the future"; `VALIDATE` then
audits the past without blocking writers. (In true production you'd add
lock timeouts and batch the backfill — Part 5's lesson 44 touches why;
the *shape* is what you're drilling here.)

## Exercise 1 — the NOT NULL three-step

Edit `ex1/solution.sql`. Give `customers` a `loyalty_tier` text column,
NOT NULL by the end, backfilled as: `'vip'` for customers with **more
than 20 orders** (there are exactly 250), `'member'` for everyone else.
Do it as the three-step. For the backfill, two set-based UPDATEs (set
everyone `'member'`, then upgrade the vips with an IN-subquery) beat a
per-row correlated CASE by roughly a thousand-fold — the gate will feel
the difference in runtime if you pick wrong.

Run: `uv run dojo test 28_altering_live_schemas ex1`

## Exercise 2 — the NOT VALID two-step

Edit `ex2/solution.sql`. Business rule: no order under 5.00. Add CHECK
constraint **named `orders_total_min`** (`total >= 5`) to `orders` using
NOT VALID, then VALIDATE it. The gate verifies the constraint exists,
**is validated** (it checks `pg_constraint.convalidated` — leaving it
NOT VALID forever is the classic half-finished migration), and rejects a
1.00 order.

Run: `uv run dojo test 28_altering_live_schemas ex2`

## The gate

```python
"""Gates for 28_altering_live_schemas. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "customers", {"loyalty_tier": "text"})
    catalog.assert_not_null(lesson_db, "customers", "loyalty_tier")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM customers WHERE loyalty_tier = 'vip'",
        250, "exactly the >20-order customers are vip")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM customers WHERE loyalty_tier = 'member'",
        49750, "everyone else is member")


def test_ex2(lesson_db):
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_check(lesson_db, "orders", "total")
    grader.assert_scalar(
        lesson_db,
        "SELECT convalidated FROM pg_constraint "
        "WHERE conname = 'orders_total_min'",
        True, "the constraint was VALIDATEd, not left NOT VALID forever")
    catalog.rejects(
        lesson_db,
        "INSERT INTO orders (id, customer_id, status, total, created_at) "
        "VALUES (900001, 1, 'pending', 1.00, '2023-11-15')",
        why="new orders under the 5.00 minimum must be refused")
```

## The teaching point

Migration reviews in serious shops ask one question about every ALTER:
**what lock, for how long, scanning what?** The three-step and two-step
exist because the answers to "add NOT NULL column" and "add constraint"
are otherwise "exclusive, minutes, everything" — an outage disguised as
one line of DDL. You now know the disguise; Part 5 gives you the tools
to see the scan itself.

Next: **29_design_capstone** — a schema of your own, from a prose spec.
