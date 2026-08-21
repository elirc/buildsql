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

## Exercise 3 — the column that costs nothing to add

Edit `ex3/solution.sql`. Merchandising wants to hide discontinued
products without deleting them. Add a column to `products`:

```sql
ALTER TABLE products ADD COLUMN is_archived boolean NOT NULL DEFAULT false;
```

One statement — and the point of the exercise is *why one statement is
enough*. Before PostgreSQL 11, adding a `NOT NULL` column with a default
rewrote the entire table under an `ACCESS EXCLUSIVE` lock: every query
queued behind it, and on a large table that meant an outage. Since 11, a
**constant** default is stored once in the catalog and materialised lazily
as rows are read or updated, so the operation is instant regardless of
table size.

The word doing the work is *constant*. `DEFAULT false` is instant;
`DEFAULT random()` or `DEFAULT now()` is not, because each row would need a
different value — and PostgreSQL falls back to the full rewrite without
telling you. Knowing which side of that line your `ALTER` falls on is the
difference between a deploy and an incident.

The gate checks the column exists, is `NOT NULL`, that all 10,000 existing
rows read as `false`, and that a fresh insert defaults correctly.

Run: `uv run dojo test 28_altering_live_schemas ex3`

## Exercise 4 — DROP COLUMN does not free the space

Edit `ex4/solution.sql`. The `reviews.body` text is being moved to a
separate document store. Drop it:

```sql
ALTER TABLE reviews DROP COLUMN body;
```

One statement, instant, and it does **not** reclaim a single byte.
`DROP COLUMN` is a *logical* delete: PostgreSQL marks the attribute
dropped in the catalog and stops returning it, but the data stays inside
every existing row on disk. The space comes back only when each row is
next rewritten — by `VACUUM FULL`, by a `CLUSTER`, or gradually as rows
are updated.

The gate proves it: it measures `pg_relation_size('reviews')` before and
after your statement and asserts the two are **equal**.

That is not a flaw, it is the trade. An instant, non-blocking `ALTER` on a
million-row table is worth far more than the disk, and reclaiming space
requires an exclusive lock you would rather schedule than take by
surprise. The mistake to avoid is the one made in the other direction:
dropping a column to fix a disk-space alert, and being surprised when the
graph does not move.

Run: `uv run dojo test 28_altering_live_schemas ex4`

## The gate

```python
"""Gates for 28_altering_live_schemas. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    # measured, not hard-coded, so the gate holds at any DOJO_SCALE
    vips = lesson_db.execute(
        "SELECT count(*) FROM (SELECT customer_id FROM orders "
        "GROUP BY customer_id HAVING count(*) > 20) t").fetchone()[0]
    everyone = lesson_db.execute("SELECT count(*) FROM customers").fetchone()[0]

    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "customers", {"loyalty_tier": "text"})
    catalog.assert_not_null(lesson_db, "customers", "loyalty_tier")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM customers WHERE loyalty_tier = 'vip'",
        vips, "exactly the >20-order customers are vip")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM customers WHERE loyalty_tier = 'member'",
        everyone - vips, "everyone else is member")


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


def test_ex3(lesson_db):
    rows = lesson_db.execute("SELECT count(*) FROM products").fetchone()[0]
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "products", {"is_archived": "boolean"})
    catalog.assert_not_null(lesson_db, "products", "is_archived")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM products WHERE is_archived = false",
        rows, "every existing row reads as false without a rewrite")
    lesson_db.execute("SAVEPOINT default_probe")
    lesson_db.execute(
        "INSERT INTO products (id, name, category, price, description, attributes) "
        "VALUES (99001, 'Probe', 'books', 1.00, 'x', '{}'::jsonb)")
    grader.assert_scalar(
        lesson_db, "SELECT is_archived FROM products WHERE id = 99001",
        False, "new rows get the default too")
    lesson_db.execute("ROLLBACK TO SAVEPOINT default_probe")


def test_ex4(lesson_db):
    size_before = lesson_db.execute(
        "SELECT pg_relation_size('reviews')").fetchone()[0]
    rows_before = lesson_db.execute("SELECT count(*) FROM reviews").fetchone()[0]
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM information_schema.columns "
        "WHERE table_name = 'reviews' AND column_name = 'body'",
        1, "the body column is there to begin with")

    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM information_schema.columns "
        "WHERE table_name = 'reviews' AND column_name = 'body'",
        0, "the column is gone from the catalog")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM reviews", rows_before,
        "and every row is still there - this was a catalog change, not a rewrite")
    grader.assert_scalar(
        lesson_db, "SELECT pg_relation_size('reviews')", size_before,
        "the table is exactly the same size on disk: DROP COLUMN is logical, "
        "and the bytes come back only when each row is next rewritten")
```

## The teaching point

Migration reviews in serious shops ask one question about every ALTER:
**what lock, for how long, scanning what?** The three-step and two-step
exist because the answers to "add NOT NULL column" and "add constraint"
are otherwise "exclusive, minutes, everything" — an outage disguised as
one line of DDL. You now know the disguise; Part 5 gives you the tools
to see the scan itself.

Next: **29_design_capstone** — a schema of your own, from a prose spec.
