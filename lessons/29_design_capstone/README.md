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

## Exercise 3 — the usage report

> *"While you're in there — Ops also wants to see how often each card gets
> used, not just what's left on it. Cards nobody has touched should show
> up as zero, obviously."*

Edit `ex3/solution.sql`. Create view **`gift_card_usage`** with three
columns:

- `gift_card_id`
- `redemptions` — how many redemption rows the card has (**0**, not NULL,
  for a card nobody has redeemed)
- `used` — the total amount redeemed (**0**, not NULL, for the same cards)

Your ex1 schema is created first automatically.

"Obviously" is the requester doing what requesters do. The trap is the same
one ex2 sprang, arriving twice in one view: a `LEFT JOIN` is needed so
untouched cards survive, `count(r.id)` rather than `count(*)` so they count
zero, and `coalesce(sum(...), 0)` because `sum` over no rows is NULL rather
than zero. Three lessons — 06, 09 and 27 — converging on one view.

Run: `uv run dojo test 29_design_capstone ex3`

## Exercise 4 — the batch they were printed in

> *"Last thing. The cards get printed in batches and we need to know which
> batch a card came from — sometimes a whole batch gets recalled. If we
> delete a batch record the cards themselves must survive; they're
> physically out there in people's wallets."*

Edit `ex4/solution.sql`. Two statements:

1. create `gift_card_batches` — `id` int primary key, `printed_on` date
   NOT NULL;
2. `ALTER TABLE gift_cards` to add a `batch_id` column referencing it,
   **`ON DELETE SET NULL`**.

Your ex1 schema is created first automatically.

The last sentence of the request is the spec for the delete policy, and it
rules out the other two options: `CASCADE` would destroy real gift cards
because a filing record was tidied away, and `RESTRICT` would make it
impossible to remove a batch record at all. `SET NULL` says "the card
outlives its paperwork", which is exactly what the requester described
without knowing there was a decision to make.

Note that `batch_id` must be **nullable** — both because `SET NULL`
requires it and because every card that already exists has no batch. That
is lesson 28's shape: add nullable, and never lock the table.

Run: `uv run dojo test 29_design_capstone ex4`

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


def test_ex3(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "gift_card_usage")

    lesson_db.execute(
        "INSERT INTO gift_cards (id, code, initial_balance) "
        "VALUES (901, 'GC-USED', 100.00), (902, 'GC-UNUSED', 50.00)")
    order_id = lesson_db.execute("SELECT id FROM orders LIMIT 1").fetchone()[0]
    lesson_db.execute(
        "INSERT INTO gift_card_redemptions (id, gift_card_id, order_id, amount) "
        f"VALUES (901, 901, {order_id}, 30.00), (902, 901, {order_id}, 20.00)")

    grader.assert_scalar(
        lesson_db,
        "SELECT redemptions FROM gift_card_usage WHERE gift_card_id = 901",
        2, "the used card has two redemptions")
    grader.assert_scalar(
        lesson_db, "SELECT used FROM gift_card_usage WHERE gift_card_id = 901",
        50, "30.00 + 20.00")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM gift_card_usage WHERE gift_card_id = 902",
        1, "the untouched card must still appear - LEFT JOIN, not INNER")
    grader.assert_scalar(
        lesson_db,
        "SELECT redemptions FROM gift_card_usage WHERE gift_card_id = 902",
        0, "zero redemptions, not 1 - count(r.id), not count(*)")
    grader.assert_scalar(
        lesson_db, "SELECT used FROM gift_card_usage WHERE gift_card_id = 902",
        0, "zero used, not NULL - sum over no rows needs a coalesce")


def test_ex4(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "gift_card_batches", {
        "id": "int", "printed_on": "date"})
    catalog.assert_pk(lesson_db, "gift_card_batches", ["id"])
    catalog.assert_not_null(lesson_db, "gift_card_batches", "printed_on")
    catalog.assert_table(lesson_db, "gift_cards", {"batch_id": "int"})
    catalog.assert_fk(lesson_db, "gift_cards", ["batch_id"],
                      "gift_card_batches", on_delete="SET NULL")
    catalog.rejects(
        lesson_db,
        "INSERT INTO gift_cards (id, code, initial_balance, batch_id) "
        "VALUES (911, 'GC-GHOST', 10.00, 4242)",
        why="a card printed in a batch that does not exist")
    # behavioural proof: the card outlives its batch record
    lesson_db.execute(
        "INSERT INTO gift_card_batches (id, printed_on) VALUES (1, '2023-11-14')")
    lesson_db.execute(
        "INSERT INTO gift_cards (id, code, initial_balance, batch_id) "
        "VALUES (912, 'GC-BATCHED', 25.00, 1)")
    lesson_db.execute("DELETE FROM gift_card_batches WHERE id = 1")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM gift_cards WHERE id = 912",
        1, "the card survives - it is in somebody's wallet")
    grader.assert_scalar(
        lesson_db, "SELECT batch_id FROM gift_cards WHERE id = 912",
        None, "and its batch_id went to NULL rather than taking the card with it")
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
