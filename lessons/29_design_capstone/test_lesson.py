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
