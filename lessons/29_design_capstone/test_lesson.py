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
