# 29 — Design capstone: gift cards

The spec below is written the way specs actually arrive: in prose, with
the constraints implied rather than listed. Your job is to translate it
into tables, keys, constraints, and one view — everything Part 4 taught,
composed. The gate checks **properties**, not your exact DDL: several
correct designs pass, and yours only has to honor the named entry points.

> *"We're launching gift cards. Each card has a unique printed code and
> an initial balance — obviously never negative. Customers redeem a card
> against an order; a card can be used across multiple orders (partial
> redemption), and each redemption must say how much was used — a
> positive amount, naturally, tied to a real order in our system. Ops
> wants to look up any card and see how much is left on it."*

Required entry points (the gate queries these names):

- Table `gift_cards`: `id` (int, PK), `code` (text, NOT NULL, unique),
  `initial_balance` (numeric, CHECKed non-negative). Add whatever else
  seems right (an expiry date? issued_on? your call — ungraded).
- Table `gift_card_redemptions`: `id` (int, PK), `gift_card_id` (FK →
  `gift_cards`), `order_id` (FK → `orders`), `amount` (numeric, CHECKed
  positive).
- View `gift_card_balances`: `gift_card_id`, `remaining` = initial
  balance minus all redemptions — **including cards never redeemed**,
  which must show their full balance (there is a lesson-09/27 trap here;
  the gate springs it).

## Exercise 1 — the schema

Edit `ex1/solution.sql`. The two tables, with every property the prose
implies. Before running the gate, attack your own schema in the lab the
way the gate will: negative card, orphan redemption, duplicate code,
zero-amount redemption.

Run: `uv run dojo test 29_design_capstone ex1`

## Exercise 2 — the balance view

Edit `ex2/solution.sql`. The `gift_card_balances` view. The gate inserts
a card with two redemptions (expects the arithmetic) and a card with
none (expects the full balance — not NULL, not a missing row).

Run: `uv run dojo test 29_design_capstone ex2`

## The gate

```python
"""Gates for 29_design_capstone. Quoted verbatim in README.md.

Property-based gates: several correct designs pass. The required entry
points (table/column names below) are the contract; everything else -
extra columns, extra constraints, delete policies beyond the required
ones - is your call.
"""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "gift_cards", {
        "id": "int", "code": "text", "initial_balance": "numeric"})
    catalog.assert_pk(lesson_db, "gift_cards", ["id"])
    catalog.assert_unique(lesson_db, "gift_cards", ["code"])
    catalog.assert_not_null(lesson_db, "gift_cards", "code")
    catalog.assert_check(lesson_db, "gift_cards", "initial_balance")
    catalog.assert_table(lesson_db, "gift_card_redemptions", {
        "id": "int", "gift_card_id": "int", "order_id": "int",
        "amount": "numeric"})
    catalog.assert_pk(lesson_db, "gift_card_redemptions", ["id"])
    catalog.assert_fk(lesson_db, "gift_card_redemptions", ["gift_card_id"],
                      "gift_cards")
    catalog.assert_fk(lesson_db, "gift_card_redemptions", ["order_id"],
                      "orders")
    catalog.assert_check(lesson_db, "gift_card_redemptions", "amount")

    catalog.rejects(
        lesson_db,
        "INSERT INTO gift_cards (id, code, initial_balance) "
        "VALUES (1, 'GC-NEG', -100)",
        why="cards can't be born owing money")
    catalog.rejects(
        lesson_db,
        "INSERT INTO gift_card_redemptions (id, gift_card_id, order_id, amount) "
        "VALUES (1, 12345, 1, 10)",
        why="redemption against a card that doesn't exist")
    catalog.accepts(
        lesson_db,
        "INSERT INTO gift_cards (id, code, initial_balance) "
        "VALUES (1, 'GC-OK', 100)")
    lesson_db.execute("SAVEPOINT code_probe")
    lesson_db.execute(
        "INSERT INTO gift_cards (id, code, initial_balance) VALUES (2, 'GC-X', 50)")
    catalog.rejects(
        lesson_db,
        "INSERT INTO gift_cards (id, code, initial_balance) VALUES (3, 'GC-X', 50)",
        why="two physical cards can't share a code")
    lesson_db.execute("ROLLBACK TO SAVEPOINT code_probe")


def test_ex2(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "gift_card_balances")

    lesson_db.execute(
        "INSERT INTO gift_cards (id, code, initial_balance) VALUES "
        "(10, 'GC-A', 100.00), (11, 'GC-B', 40.00)")
    lesson_db.execute(
        "INSERT INTO gift_card_redemptions (id, gift_card_id, order_id, amount) "
        "VALUES (1, 10, 1, 30.00), (2, 10, 2, 20.00)")
    grader.assert_scalar(
        lesson_db,
        "SELECT remaining FROM gift_card_balances WHERE gift_card_id = 10",
        50, "100 issued minus 30 and 20 redeemed leaves 50")
    grader.assert_scalar(
        lesson_db,
        "SELECT remaining FROM gift_card_balances WHERE gift_card_id = 11",
        40, "a card with NO redemptions shows its full balance - "
            "if this is NULL or missing, revisit lessons 09 and 27")
```

## The teaching point

Notice what the gate does *not* check: whether a card's redemptions can
exceed its balance. That invariant spans **multiple rows**, and CHECK
constraints see only one row at a time — enforcing it takes a trigger, a
serialized transaction pattern, or application logic with row locks
(`SELECT ... FOR UPDATE`). Knowing which invariants the schema *can't*
hold — and saying so out loud in design review, and writing down where
the enforcement actually lives — is precisely the judgment this Part
was building toward.

**Part 4 complete.** Next: **30_reading_explain** opens Part 5 — you
finally get to make things *fast*.
