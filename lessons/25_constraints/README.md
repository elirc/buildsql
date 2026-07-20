# 25 — Constraints: promises the database keeps

Lesson 24 chose types; this lesson adds **rules**: values that can't be
missing, numbers that can't go negative, codes that can't repeat, and
references that can't dangle. Application code also checks these things —
but application code has versions, bugs, race conditions, and that one
batch script someone runs directly against the database. A constraint is
checked *every time, by everyone, atomically*. It's the only validation
that can't be bypassed.

The gates here **attack your schema**: after checking the catalog, they
fire INSERTs that *should* fail. A constraint that exists but doesn't
bite fails the gate.

## Concept

```sql
CREATE TABLE giftcards (
  id        int           PRIMARY KEY,
  code      text          NOT NULL UNIQUE,
  balance   numeric(10,2) NOT NULL CHECK (balance >= 0),
  issued_on date          NOT NULL DEFAULT '2023-11-14'
);
```

- **NOT NULL** — the cheapest, most underused constraint. Every nullable
  column is a promise that all future queries handle lesson 05 correctly.
- **DEFAULT** — the value used when the INSERT omits the column. Pairs
  naturally with NOT NULL.
- **UNIQUE** — creates the index that lesson 22's ON CONFLICT needs.
- **CHECK** — any boolean expression over the row's own columns.
- **FOREIGN KEY** with an `ON DELETE` policy — what happens to child
  rows when the parent dies:
  - `RESTRICT`/`NO ACTION` (default): refuse to delete a referenced parent
  - `CASCADE`: children die with the parent (redemptions of a card)
  - `SET NULL`: children orphan gracefully (a nullable FK only)

  Choosing the policy is a *domain* decision, not a technical one: "what
  should happen to redemptions when a gift card is deleted?" is a
  question for the product owner — the schema just records the answer.

## Exercise 1 — the giftcards table

Edit `ex1/solution.sql`. Create `giftcards` exactly as the concept block
above (that's the spec — and yes, this one's given; the gate's probes
are the real teacher here). Read the gate to see the attacks: negative
balance, duplicate code, omitted `issued_on`.

Run: `uv run dojo test 25_constraints ex1`

## Exercise 2 — redemptions with a CASCADE

Edit `ex2/solution.sql`. Create `giftcard_redemptions` (your ex1 table is
created first automatically):

- `id` int primary key
- `giftcard_id` int NOT NULL, FK to `giftcards`, **ON DELETE CASCADE**
- `amount` `numeric(10,2)` NOT NULL, CHECK strictly positive

The gate inserts a card with a redemption, deletes the card, and expects
the redemption to vanish.

Run: `uv run dojo test 25_constraints ex2`

## Exercise 3 — belt and suspenders on email

Edit `ex3/solution.sql`. Create `newsletter_subs`: `id` int PK, `email`
text NOT NULL UNIQUE, plus a CHECK that the email contains an `@`
(`email LIKE '%@%'` is fine — the gate probes with `'not-an-email'`).

Run: `uv run dojo test 25_constraints ex3`

## Challenge — the join table (optional)

Edit `challenge/solution.sql`. Customers wishlist products. Create
`wishlists`:

- `customer_id` FK to `customers`, **ON DELETE CASCADE**
- `product_id` FK to `products` (default delete policy)
- **composite PRIMARY KEY (customer_id, product_id)** — the pair is the
  identity; no surrogate id column needed, and duplicates are
  structurally impossible.

This is lesson 24's "arrays vs join tables" answered properly.

Run: `uv run dojo test 25_constraints challenge`

## The gate

```python
"""Gates for 25_constraints. Quoted verbatim in README.md.

The probes (catalog.rejects / catalog.accepts) run real INSERTs inside a
savepoint - your constraints must actually bite, not merely exist.
"""
import pytest

from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "giftcards", {
        "id": "int", "code": "text", "balance": "numeric", "issued_on": "date"})
    catalog.assert_pk(lesson_db, "giftcards", ["id"])
    catalog.assert_unique(lesson_db, "giftcards", ["code"])
    catalog.assert_check(lesson_db, "giftcards", "balance")
    catalog.rejects(
        lesson_db,
        "INSERT INTO giftcards (id, code, balance) VALUES (1, 'GC-NEG', -5.00)",
        why="a gift card can never hold negative money")
    catalog.accepts(
        lesson_db,
        "INSERT INTO giftcards (id, code, balance) VALUES (1, 'GC-OK', 50.00)")
    lesson_db.execute("SAVEPOINT dup_probe")
    lesson_db.execute(
        "INSERT INTO giftcards (id, code, balance) VALUES (2, 'GC-DUP', 10.00)")
    catalog.rejects(
        lesson_db,
        "INSERT INTO giftcards (id, code, balance) VALUES (3, 'GC-DUP', 10.00)",
        why="codes are printed on physical cards - duplicates are chaos")
    lesson_db.execute("ROLLBACK TO SAVEPOINT dup_probe")
    lesson_db.execute("SAVEPOINT default_probe")
    lesson_db.execute(
        "INSERT INTO giftcards (id, code, balance) VALUES (4, 'GC-DEF', 25.00)")
    grader.assert_scalar(
        lesson_db, "SELECT issued_on FROM giftcards WHERE id = 4",
        __import__("datetime").date(2023, 11, 14),
        "issued_on defaults to 2023-11-14 when omitted")
    lesson_db.execute("ROLLBACK TO SAVEPOINT default_probe")


def test_ex2(lesson_db):
    L.exercise("ex1")  # ex2 builds on ex1's table
    lesson_db.execute(L.exercise("ex1").solution_sql)
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "giftcard_redemptions", {
        "id": "int", "giftcard_id": "int", "amount": "numeric"})
    catalog.assert_pk(lesson_db, "giftcard_redemptions", ["id"])
    catalog.assert_fk(lesson_db, "giftcard_redemptions", ["giftcard_id"],
                      "giftcards", on_delete="CASCADE")
    catalog.assert_check(lesson_db, "giftcard_redemptions", "amount")
    catalog.rejects(
        lesson_db,
        "INSERT INTO giftcard_redemptions (id, giftcard_id, amount) "
        "VALUES (1, 999, 10.00)",
        why="a redemption against a nonexistent card is an orphan")
    catalog.rejects(
        lesson_db,
        "INSERT INTO giftcard_redemptions (id, giftcard_id, amount) "
        "VALUES (1, 1, 0)",
        why="zero (or negative) redemptions are meaningless")
    # behavioral proof of ON DELETE CASCADE
    lesson_db.execute(
        "INSERT INTO giftcards (id, code, balance) VALUES (7, 'GC-CASCADE', 30)")
    lesson_db.execute(
        "INSERT INTO giftcard_redemptions (id, giftcard_id, amount) "
        "VALUES (7, 7, 10)")
    lesson_db.execute("DELETE FROM giftcards WHERE id = 7")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM giftcard_redemptions WHERE giftcard_id = 7",
        0, "deleting the card cascades to its redemptions")


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "newsletter_subs", {
        "id": "int", "email": "text"})
    catalog.assert_pk(lesson_db, "newsletter_subs", ["id"])
    catalog.assert_unique(lesson_db, "newsletter_subs", ["email"])
    catalog.assert_not_null(lesson_db, "newsletter_subs", "email")
    catalog.assert_check(lesson_db, "newsletter_subs", "email")
    catalog.rejects(
        lesson_db,
        "INSERT INTO newsletter_subs (id, email) VALUES (1, 'not-an-email')",
        why="no @ sign - the CHECK must catch garbage")
    catalog.accepts(
        lesson_db,
        "INSERT INTO newsletter_subs (id, email) VALUES (1, 'a@b.example')")


@pytest.mark.challenge
def test_challenge(lesson_db):
    ex = L.exercise("challenge")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "wishlists", {
        "customer_id": "int", "product_id": "int"})
    catalog.assert_pk(lesson_db, "wishlists", ["customer_id", "product_id"])
    catalog.assert_fk(lesson_db, "wishlists", ["customer_id"], "customers",
                      on_delete="CASCADE")
    catalog.assert_fk(lesson_db, "wishlists", ["product_id"], "products")
    catalog.rejects(
        lesson_db,
        "INSERT INTO wishlists (customer_id, product_id) VALUES (1, 999999)",
        why="wishing for a product that doesn't exist")
    lesson_db.execute("SAVEPOINT pair_probe")
    lesson_db.execute(
        "INSERT INTO wishlists (customer_id, product_id) VALUES (1, 5)")
    catalog.rejects(
        lesson_db,
        "INSERT INTO wishlists (customer_id, product_id) VALUES (1, 5)",
        why="the same product twice on one wishlist is a duplicate pair")
    lesson_db.execute("ROLLBACK TO SAVEPOINT pair_probe")
```

## The teaching point

Read a production incident database and count how many begin "invalid
data got in because...". Constraints move that entire failure class from
runtime to write-time, from *your* debugging to the perpetrator's error
message. The senior move when inheriting a schema: list what *should* be
impossible, check which of those are actually constrained, and close the
gap before it closes on you. (Adding constraints to *live* tables safely
is lesson 28.)

Next: **26_normalization** — splitting one awful table into three good ones.
