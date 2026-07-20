# 22 — UPSERT: INSERT ... ON CONFLICT

"Insert this row — unless it exists, then update it instead." The naive
version is a SELECT-then-INSERT-or-UPDATE in application code, and it
harbors a race: two requests both SELECT, find nothing, both INSERT, one
crashes (or worse, both succeed and you have duplicates). PostgreSQL's
`ON CONFLICT` does the whole dance atomically — *if* there's a unique
constraint to conflict against. No constraint, no upsert: the constraint
**is** the mechanism.

This lesson gives you a playground via `setup.sql` (applied automatically
before each gate): an `inventory` table (`product_id` PRIMARY KEY,
`stock`, `updated_at`; products 1–100 stocked at 100) and a `price_watch`
table (products 10, 20, 30 with best-seen prices).

## Concept

```sql
INSERT INTO inventory (product_id, stock)
VALUES (50, 75)
ON CONFLICT (product_id)
DO UPDATE SET stock = EXCLUDED.stock;
```

- `ON CONFLICT (product_id)` names the **conflict target** — there must
  be a unique index/constraint on exactly that.
- `EXCLUDED` is the row that *tried* to be inserted. `SET stock =
  EXCLUDED.stock` means "take the new value"; `SET stock =
  inventory.stock + EXCLUDED.stock` would mean "add to the old".
- `DO NOTHING` swallows the conflict silently — for "register if absent".
- `DO UPDATE` takes a `WHERE` — update *only when* some condition on the
  old (`inventory.`) and new (`EXCLUDED.`) values holds.

**Idempotency** is the property worth designing for: run the statement
twice, second run is a no-op. `SET stock = EXCLUDED.stock` (overwrite) is
idempotent; `stock + EXCLUDED.stock` (accumulate) is not — retry a timed-
out request and inventory doubles. Every gate in this lesson **runs your
statement twice** and fails if the second run changes anything.

## Exercise 1 — the stocktake sync

Edit `ex1/solution.sql`. The warehouse counted shelves: product **50 has
75 units**, product **150 has 40 units**. One statement: insert-or-
overwrite both rows into `inventory` (only `product_id` and `stock`;
`updated_at` keeps its default).

Run: `uv run dojo test 22_upsert ex1`

## Exercise 2 — register if absent

Edit `ex2/solution.sql`. Products **60** and **200** must have inventory
rows. If a row already exists (60 does, at stock 100), it must **not** be
touched; if absent (200), create it with stock 0. One statement.

Run: `uv run dojo test 22_upsert ex2`

## Challenge — conditional upsert (optional)

Edit `challenge/solution.sql`. `price_watch` tracks the best (lowest)
price ever seen per product. Today's crawl: product 10 at **45.00**,
product 20 at **95.00**, product 40 at **60.00**. One statement that
inserts new products and updates existing ones **only if the new price
is lower**. (10 improves on 50 → updates; 95 is worse than 80 → row must
stay; 40 is new → inserts.)

Run: `uv run dojo test 22_upsert challenge`

## The gate

```python
"""Gates for 22_upsert. Quoted verbatim in README.md.

Each gate runs your statement TWICE and asserts the second run changed
nothing - upserts must be idempotent or they aren't upserts.
"""
import pytest

from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def _snapshot(conn, table):
    return conn.execute(
        f"SELECT * FROM {table} ORDER BY product_id").fetchall()


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    first_run = _snapshot(lesson_db, "inventory")

    lesson_db.execute(ex.solution_sql)  # run it AGAIN
    lesson_db.commit()
    grader.assert_rows_equal(_snapshot(lesson_db, "inventory"), first_run,
                             ordered=True)  # idempotent, or it isn't an upsert

    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 50",
        75, "existing product 50 overwritten to the stocktake value")
    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 150",
        40, "new product 150 inserted with its stocktake value")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM inventory",
        101, "exactly one new row appeared")


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    first_run = _snapshot(lesson_db, "inventory")

    lesson_db.execute(ex.solution_sql)  # run it AGAIN
    lesson_db.commit()
    grader.assert_rows_equal(_snapshot(lesson_db, "inventory"), first_run,
                             ordered=True)

    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 60",
        100, "existing product 60 must NOT be touched by DO NOTHING")
    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 200",
        0, "new product 200 registered with stock 0")


@pytest.mark.challenge
def test_challenge(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("challenge")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    first_run = _snapshot(lesson_db, "price_watch")

    lesson_db.execute(ex.solution_sql)  # run it AGAIN
    lesson_db.commit()
    grader.assert_rows_equal(_snapshot(lesson_db, "price_watch"), first_run,
                             ordered=True)

    grader.assert_scalar(
        lesson_db, "SELECT best_price FROM price_watch WHERE product_id = 10",
        45, "product 10: 45.00 beats 50.00, so it updates")
    grader.assert_scalar(
        lesson_db, "SELECT best_price FROM price_watch WHERE product_id = 20",
        80, "product 20: 95.00 is worse than 80.00, so it must NOT update")
    grader.assert_scalar(
        lesson_db, "SELECT best_price FROM price_watch WHERE product_id = 40",
        60, "product 40 is new, so it inserts")
```

## The teaching point

Upsert is the canonical example of "push the race into the database":
the uniqueness fight is settled by the same machinery that enforces the
constraint, atomically, under any concurrency. Whenever application code
does check-then-act against the database, ask what happens when two
copies run at once — and whether a constraint plus ON CONFLICT (or its
cousins: advisory locks, SERIALIZABLE) should own the decision instead.
Part 4 is where you learn to *design* the constraints this depends on.

Next: **23_transactions** — all-or-nothing.
