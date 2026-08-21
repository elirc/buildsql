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


def test_ex4(lesson_db):
    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "promo_codes", {
        "id": "int", "campaign": "text", "code": "text",
        "percent_off": "numeric"})
    catalog.assert_pk(lesson_db, "promo_codes", ["id"])
    catalog.assert_unique(lesson_db, "promo_codes", ["campaign", "code"])
    catalog.assert_not_null(lesson_db, "promo_codes", "campaign")
    catalog.assert_check(lesson_db, "promo_codes", "percent_off")
    catalog.rejects(
        lesson_db,
        "INSERT INTO promo_codes (id, campaign, code, percent_off) "
        "VALUES (1, 'spring', 'SAVE10', 0)",
        why="a 0% discount is not a discount")
    catalog.rejects(
        lesson_db,
        "INSERT INTO promo_codes (id, campaign, code, percent_off) "
        "VALUES (1, 'spring', 'SAVE10', 101)",
        why="more than 100% off means paying the customer")
    lesson_db.execute("SAVEPOINT scope_probe")
    lesson_db.execute(
        "INSERT INTO promo_codes (id, campaign, code, percent_off) "
        "VALUES (1, 'spring', 'SAVE10', 10)")
    catalog.rejects(
        lesson_db,
        "INSERT INTO promo_codes (id, campaign, code, percent_off) "
        "VALUES (2, 'spring', 'SAVE10', 20)",
        why="the same code twice in one campaign is a duplicate")
    catalog.accepts(
        lesson_db,
        "INSERT INTO promo_codes (id, campaign, code, percent_off) "
        "VALUES (3, 'autumn', 'SAVE10', 10)",
        why="the same code in a DIFFERENT campaign must be allowed")
    lesson_db.execute("ROLLBACK TO SAVEPOINT scope_probe")


def test_ex5(lesson_db):
    ex = L.exercise("ex5")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "campaigns", {"id": "int", "name": "text"})
    catalog.assert_table(lesson_db, "campaign_items", {
        "id": "int", "campaign_id": "int", "product_id": "int"})
    catalog.assert_pk(lesson_db, "campaign_items", ["id"])
    catalog.assert_fk(lesson_db, "campaign_items", ["campaign_id"], "campaigns",
                      on_delete="SET NULL")
    catalog.assert_fk(lesson_db, "campaign_items", ["product_id"], "products")
    catalog.rejects(
        lesson_db,
        "INSERT INTO campaign_items (id, campaign_id, product_id) "
        "VALUES (1, 999, 1)",
        why="a campaign item pointing at a campaign that does not exist")
    # behavioural proof of ON DELETE SET NULL
    lesson_db.execute("INSERT INTO campaigns (id, name) VALUES (1, 'spring')")
    lesson_db.execute(
        "INSERT INTO campaign_items (id, campaign_id, product_id) VALUES (1, 1, 5)")
    lesson_db.execute("DELETE FROM campaigns WHERE id = 1")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM campaign_items WHERE id = 1",
        1, "the item survives its campaign - SET NULL, not CASCADE")
    grader.assert_scalar(
        lesson_db, "SELECT campaign_id FROM campaign_items WHERE id = 1",
        None, "and its campaign_id was set to NULL")


def test_ex6(lesson_db):
    ex = L.exercise("ex6")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "bookings", {
        "id": "int", "room": "text", "starts_on": "date", "ends_on": "date"})
    catalog.assert_pk(lesson_db, "bookings", ["id"])
    catalog.assert_not_null(lesson_db, "bookings", "starts_on")
    catalog.assert_not_null(lesson_db, "bookings", "ends_on")
    catalog.assert_check(lesson_db, "bookings", "ends_on")
    catalog.rejects(
        lesson_db,
        "INSERT INTO bookings (id, room, starts_on, ends_on) "
        "VALUES (1, 'dojo', '2023-11-10', '2023-11-01')",
        why="a booking that ends before it starts")
    catalog.rejects(
        lesson_db,
        "INSERT INTO bookings (id, room, starts_on, ends_on) "
        "VALUES (1, 'dojo', '2023-11-10', '2023-11-10')",
        why="zero-length bookings - the CHECK must be strict, not >=")
    catalog.accepts(
        lesson_db,
        "INSERT INTO bookings (id, room, starts_on, ends_on) "
        "VALUES (1, 'dojo', '2023-11-10', '2023-11-12')",
        why="an ordinary two-day booking")


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
