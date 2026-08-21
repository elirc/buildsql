# 21 — INSERT, UPDATE, DELETE

Twenty lessons of reading; time to write. Part 3's rule of engagement:
**every graded run happens on a throwaway clone**, so the worst you can
do is fail a gate. Use that freedom — the fear of mutating data only goes
away through practicing mutation.

The gates change shape here too: there's no `expected.sql` anymore.
The test runs *your* statements, then interrogates the database state —
row counts, specific values, untouched neighbors. Read the gate before
you start; knowing what will be checked *is* the spec.

## Concept

```sql
-- multi-row insert
INSERT INTO products (id, name, category, price, description, attributes)
VALUES (20001, ..., '{"color": "black", ...}'),
       (20002, ...);

-- insert from a query (copy/transform existing rows)
INSERT INTO orders (id, customer_id, status, total, created_at)
SELECT id + 1000000, customer_id, 'pending', total, created_at
FROM orders WHERE ...;

-- update, optionally joining another table for its data
UPDATE order_items oi
SET price = p.price
FROM products p
WHERE p.id = oi.product_id AND ...;

-- delete, optionally joining (USING is DELETE's FROM)
DELETE FROM reviews r
USING products p
WHERE p.id = r.product_id AND p.category = '...';

-- any of them can hand back what they touched
UPDATE ... RETURNING id, price;
```

Three habits that separate professionals:

1. **Scope first.** Before any UPDATE/DELETE, run its WHERE as a SELECT
   and eyeball the count. The `dojo lab` clone is perfect for this.
2. **RETURNING beats a follow-up SELECT** — atomic, race-free, one round
   trip.
3. **Row counts are feedback.** `UPDATE 47` when you expected 3 is the
   database telling you your WHERE is wrong — *after* it's too late.
   Habit 1 exists because of this.

## Exercise 1 — merch drop (INSERT)

Edit `ex1/solution.sql`. One multi-row INSERT adding three products:

| id | name | category | price | description | attributes |
|---|---|---|---|---|---|
| 20001 | Dojo Tee | clothing | 25.00 | Official SQL Dojo t-shirt | `{"color": "black", "size": "l", "tags": ["new", "limited"]}` |
| 20002 | Dojo Mug | garden | 12.50 | Ceramic mug for plan-reading mornings | `{"color": "white", "size": "m", "tags": ["new", "bestseller"]}` |
| 20003 | Dojo Handbook | books | 16.50 | Print companion to the course | `{"color": "blue", "size": "s", "tags": ["new", "classic"]}` |

Run: `uv run dojo test 21_insert_update_delete ex1`

## Exercise 2 — targeted price cut (UPDATE)

Edit `ex2/solution.sql`. The 300 never-ordered products aren't moving;
merchandising wants **10% off the never-ordered products in `garden`**
(only those!): set `price = round(price * 0.9, 2)`. The gate checks the
targets got exactly that price *and every other product is untouched* —
scope discipline is the graded skill.

Run: `uv run dojo test 21_insert_update_delete ex2`

## Exercise 3 — takedown (DELETE)

Edit `ex3/solution.sql`. Legal says the 1-star reviews of product 42
are a brigading attack: **delete every review of product 42 with rating
1** — and nothing else. The gate counts the collateral.

Run: `uv run dojo test 21_insert_update_delete ex3`

## Exercise 4 — UPDATE with a join (UPDATE ... FROM)

Edit `ex4/solution.sql`. Compliance is withdrawing from a market: **cancel
every `pending` order belonging to a customer in Japan (`'JP'`)** — set
their `status` to `'cancelled'`. Nothing else may change.

The condition lives in a *different table* from the rows you are updating,
which is what `UPDATE ... FROM` is for:

```sql
UPDATE orders o
SET status = 'cancelled'
FROM customers c
WHERE c.id = o.customer_id AND ...
```

`FROM` here is not a join in the `SELECT` sense — it names extra tables the
`WHERE` clause may reference, and the update applies to `orders` only. The
danger is the one you now expect: forget `c.id = o.customer_id` and every
pending order in the database matches, because the missing condition turns
it into a cross product. Rehearse the `WHERE` as a `SELECT` in the lab
first and read the count.

Run: `uv run dojo test 21_insert_update_delete ex4`

## Exercise 5 — DELETE with a join (DELETE ... USING)

Edit `ex5/solution.sql`. A moderation sweep: **delete every 1-star review
of a `garden` product whose product `id` is below 100** — and nothing
else.

`DELETE` spells its extra-tables clause `USING` rather than `FROM` (because
`FROM` is already taken by `DELETE FROM`):

```sql
DELETE FROM reviews r
USING products p
WHERE p.id = r.product_id AND ...
```

Three conditions: the join key, the category, and the rating — plus the id
bound. Miss the join key and you delete every 1-star review in the
database. The gate counts the collateral, as it did in exercise 3.

Run: `uv run dojo test 21_insert_update_delete ex5`

## Exercise 6 — RETURNING what you changed

Edit `ex6/solution.sql`. Clearance: set the `price` of products **11, 22
and 33** to exactly **9.99**, and have the statement **hand back the rows
it changed** — `id`, `name`, `price` — using `RETURNING`.

One statement. The gate reads the result set your statement produced, so
the `RETURNING` clause is graded, not just the final state.

`RETURNING` is not a convenience. A follow-up `SELECT` after an `UPDATE`
is a second round trip against a database that may have changed underneath
you; `RETURNING` reports exactly the rows this statement touched, atomically,
in the same round trip. It works on `INSERT`, `UPDATE` and `DELETE` alike —
`DELETE ... RETURNING *` is how you archive rows you are about to destroy.

Run: `uv run dojo test 21_insert_update_delete ex6`

## Challenge — reorder flow (INSERT ... SELECT) (optional)

Edit `challenge/solution.sql`. Support wants a one-click "reorder":
recreate order **123** as new order **600001** — same customer, same
total, status `'pending'`, `created_at` timestamp `'2023-11-15'` — and
copy its line items as new rows with `id = old id + 1000000` and
`order_id = 600001` (same product, quantity, price). Two INSERT ...
SELECT statements in one file.

Run: `uv run dojo test 21_insert_update_delete challenge`

## The gate

```python
"""Gates for 21_insert_update_delete. Quoted verbatim in README.md."""
import pytest

from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM products WHERE id IN (20001, 20002, 20003)",
        3, "all three new products exist")
    grader.assert_scalar(
        lesson_db, "SELECT name FROM products WHERE id = 20002",
        "Dojo Mug", "product 20002 is the mug")
    grader.assert_scalar(
        lesson_db, "SELECT category FROM products WHERE id = 20003",
        "books", "product 20003 sits in books")
    grader.assert_scalar(
        lesson_db,
        "SELECT sum(price) FROM products WHERE id IN (20001, 20002, 20003)",
        54, "prices add up (25.00 + 12.50 + 16.50)")


def test_ex2(lesson_db):
    target_where = """
        category = 'garden'
        AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = products.id)
    """
    expected_target = lesson_db.execute(
        f"SELECT sum(round(price * 0.9, 2)) FROM products WHERE {target_where}"
    ).fetchone()[0]
    untouched_before = lesson_db.execute(
        f"SELECT sum(price) FROM products WHERE NOT ({target_where})"
    ).fetchone()[0]

    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        f"SELECT sum(price) FROM products WHERE {target_where}",
        expected_target, "never-ordered garden products got exactly 10% off, rounded")
    grader.assert_scalar(
        lesson_db,
        f"SELECT sum(price) FROM products WHERE NOT ({target_where})",
        untouched_before, "every other product's price is untouched")


def test_ex3(lesson_db):
    doomed = lesson_db.execute(
        "SELECT count(*) FROM reviews WHERE product_id = 42 AND rating = 1"
    ).fetchone()[0]
    total = lesson_db.execute("SELECT count(*) FROM reviews").fetchone()[0]
    assert doomed > 0  # seed guarantees product 42 has 1-star reviews

    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM reviews WHERE product_id = 42 AND rating = 1",
        0, "the 1-star reviews of product 42 are gone")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM reviews",
        total - doomed, "exactly the doomed reviews were deleted - no more, no less")


def test_ex4(lesson_db):
    target = lesson_db.execute(
        "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id "
        "WHERE c.country = 'JP' AND o.status = 'pending'").fetchone()[0]
    cancelled_before = lesson_db.execute(
        "SELECT count(*) FROM orders WHERE status = 'cancelled'").fetchone()[0]
    other_pending = lesson_db.execute(
        "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id "
        "WHERE c.country <> 'JP' AND o.status = 'pending'").fetchone()[0]
    assert target > 0  # the seed guarantees Japanese pending orders exist

    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id "
        "WHERE c.country = 'JP' AND o.status = 'pending'",
        0, "no pending Japanese orders remain")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM orders WHERE status = 'cancelled'",
        cancelled_before + target,
        "exactly the Japanese pending orders became cancelled - no more, no less")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id "
        "WHERE c.country <> 'JP' AND o.status = 'pending'",
        other_pending, "every other country's pending orders are untouched")


def test_ex5(lesson_db):
    doomed_sql = (
        "SELECT count(*) FROM reviews r JOIN products p ON p.id = r.product_id "
        "WHERE p.category = 'garden' AND p.id < 100 AND r.rating = 1")
    doomed = lesson_db.execute(doomed_sql).fetchone()[0]
    total = lesson_db.execute("SELECT count(*) FROM reviews").fetchone()[0]
    assert doomed > 0  # the seed guarantees such reviews exist

    ex = L.exercise("ex5")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(lesson_db, doomed_sql, 0,
                         "the targeted 1-star garden reviews are gone")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM reviews", total - doomed,
        "exactly the targeted reviews were deleted - no more, no less")


def test_ex6(lesson_db):
    ex = L.exercise("ex6")
    before = lesson_db.execute("SELECT count(*) FROM products").fetchone()[0]

    returned = ex.fetch(lesson_db, ex.solution_sql)
    lesson_db.commit()

    assert len(returned) == 3, (
        "RETURNING MISSING OR WRONG: the gate reads the result set your "
        f"statement produced and got {len(returned)} row(s), expected 3.\n"
        "  Add `RETURNING id, name, price` to your UPDATE."
    )
    assert all(len(r) == 3 for r in returned), (
        "RETURNING should hand back three columns: id, name, price."
    )
    assert {r[0] for r in returned} == {11, 22, 33}, (
        f"RETURNING gave ids {sorted(r[0] for r in returned)}, expected 11, 22, 33."
    )
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM products WHERE id IN (11, 22, 33) "
                   "AND price = 9.99",
        3, "all three products are now priced 9.99")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM products", before,
        "an UPDATE must not change the number of rows")


@pytest.mark.challenge
def test_challenge(lesson_db):
    src = lesson_db.execute(
        "SELECT customer_id, total FROM orders WHERE id = 123").fetchone()
    src_items = lesson_db.execute(
        "SELECT product_id, quantity, price FROM order_items "
        "WHERE order_id = 123 ORDER BY product_id, id").fetchall()

    ex = L.exercise("challenge")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM orders WHERE id = 600001 AND status = 'pending' "
        "AND customer_id = %d AND total = %s" % (src[0], src[1]),
        1, "order 600001 mirrors order 123 (same customer and total, status pending)")
    new_items = lesson_db.execute(
        "SELECT product_id, quantity, price FROM order_items "
        "WHERE order_id = 600001 ORDER BY product_id, id").fetchall()
    grader.assert_rows_equal(new_items, src_items, ordered=True)
```

Note the ex2 gate's shape: it snapshots the expected state *before*
running your SQL, then compares after. State gates through the rest of
the course follow this pattern.

## The teaching point

`UPDATE`/`DELETE` without a rehearsed WHERE is how companies end up on
the news. The professional ritual: SELECT the scope, read the count,
wrap the mutation in a transaction (next two lessons), check RETURNING,
*then* commit. The dojo's clones make this rehearsal free; production
never does.

Next: **22_upsert** — insert-or-update without the race condition.
