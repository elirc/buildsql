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
