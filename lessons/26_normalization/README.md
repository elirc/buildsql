# 26 — Normalization: from one awful table to 3NF

This lesson's `setup.sql` builds you a monster: `flat_orders`, one row
per (order, product) for the first 2,000 orders, with the customer's
name, email, and country **repeated on every row**, and the product's
name and category repeated likewise. Query it in the lab — it looks
convenient. It's a time bomb:

- A customer changes their name → you must update *hundreds* of rows,
  and miss one → the data now disagrees with itself (**update anomaly**).
- You can't record a customer until they order (**insertion anomaly**),
  and deleting an order can erase your only record of them
  (**deletion anomaly**).

Normalization is the cure, and you can get all the way to third normal
form with one sentence: **every non-key column must state a fact about
the key, the whole key, and nothing but the key.**

## Concept — reading the awful table through that sentence

The key of `flat_orders` is `(order_id, product_name)`. Now audit:

- `quantity`, `unit_price` — facts about the *whole key* (this product in
  this order). ✔ They stay.
- `customer_email` — a fact about `order_id` alone (*part* of the key):
  a **2NF violation**. Orders must become their own table.
- `customer_name`, `customer_country` — facts about `customer_email`,
  which isn't a key at all: a **3NF violation** (a fact about another
  non-key fact). Customers must become their own table.
- `product_category` — a fact about `product_name`. Same violation; in a
  fuller design products would split out too. (We'll fold category into
  the line-items table this once to keep the exercise focused — noting
  the imperfection *is* part of the lesson.)

Target schema (names and keys are the spec the gate checks):

```
n_customers  (email text PK, name text NOT NULL, country text NOT NULL)
n_orders     (order_id int PK,
              customer_email text NOT NULL REFERENCES n_customers(email))
n_lines      (order_id int REFERENCES n_orders(order_id),
              product_name text, category text NOT NULL,
              quantity bigint NOT NULL, unit_price numeric(10,2) NOT NULL,
              PRIMARY KEY (order_id, product_name))
```

## Exercise 1 — the DDL

Edit `ex1/solution.sql`. Create the three tables above, with those exact
names, keys, and FKs. The gate probes the FK with a ghost order.

Run: `uv run dojo test 26_normalization ex1`

## Exercise 2 — the migration

Edit `ex2/solution.sql`. Three `INSERT ... SELECT` statements filling
the new tables **from `flat_orders`** (your ex1 DDL runs first
automatically). Watch the dedup: customers appear on many flat rows but
must land in `n_customers` once — `SELECT DISTINCT` is your friend.
Order matters: parents before children, or the FKs will stop you (that's
them working).

The gate then **reconstructs the original**: it joins your three tables
back together and compares, row for row, against `flat_orders`. Lossless
decomposition isn't a slogan — it's the test.

Run: `uv run dojo test 26_normalization ex2`

## The gate

```python
"""Gates for 26_normalization. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)

RECONSTRUCT = """
    SELECT no.order_id, nc.name, nc.email, nc.country,
           nl.product_name, nl.category, nl.quantity, nl.unit_price
    FROM n_lines nl
    JOIN n_orders no    ON no.order_id = nl.order_id
    JOIN n_customers nc ON nc.email = no.customer_email
"""

ORIGINAL = """
    SELECT order_id, customer_name, customer_email, customer_country,
           product_name, product_category, quantity, unit_price
    FROM flat_orders
"""


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "n_customers", {
        "email": "text", "name": "text", "country": "text"})
    catalog.assert_pk(lesson_db, "n_customers", ["email"])
    catalog.assert_table(lesson_db, "n_orders", {
        "order_id": "int", "customer_email": "text"})
    catalog.assert_pk(lesson_db, "n_orders", ["order_id"])
    catalog.assert_fk(lesson_db, "n_orders", ["customer_email"], "n_customers")
    catalog.assert_table(lesson_db, "n_lines", {
        "order_id": "int", "product_name": "text", "category": "text",
        "quantity": "bigint", "unit_price": "numeric"})
    catalog.assert_pk(lesson_db, "n_lines", ["order_id", "product_name"])
    catalog.assert_fk(lesson_db, "n_lines", ["order_id"], "n_orders")
    catalog.rejects(
        lesson_db,
        "INSERT INTO n_orders (order_id, customer_email) "
        "VALUES (999999, 'ghost@example.com')",
        why="an order pointing at a customer that doesn't exist")


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute(L.exercise("ex1").solution_sql)
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    expected = lesson_db.execute(ORIGINAL).fetchall()
    actual = lesson_db.execute(RECONSTRUCT).fetchall()
    grader.assert_rows_equal(actual, expected)
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) = count(DISTINCT email) FROM n_customers",
        True, "each customer stored exactly once")
```

## The teaching point

Real schemas drift toward `flat_orders` one convenient column at a time
— "just add the customer name here so the report doesn't need a join".
The join you saved comes back as an update anomaly with interest. The
normalization sentence gives you the review question for any new column:
*which key is this a fact about?* If the answer isn't "this table's,
all of it", the column is knocking on the wrong table's door.
(Deliberate, measured denormalization exists — Part 5's materialized
views are the honest version.)

Next: **27_views** — names for queries.
