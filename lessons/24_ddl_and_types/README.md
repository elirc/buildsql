# 24 — DDL and choosing types

Part 4 flips your seat at the table: you've queried a schema for 24
lessons; now you get to *cause* one. `CREATE TABLE` is easy syntax — the
craft is in the type choices, and every choice is a promise to every
future query. The gates change again to match: they inspect the
**catalog** (PostgreSQL's own record of your schema, `pg_catalog`) and
then *probe* your tables with real INSERTs.

## Concept

```sql
CREATE TABLE coupons (
  code        text        PRIMARY KEY,
  percent_off numeric(5,2) NOT NULL,
  starts_on   date         NOT NULL,
  expires_on  date         NOT NULL,
  notes       text
);
```

The type decisions that come up weekly in real work:

- **text vs varchar(n)**: in PostgreSQL they're the same thing under the
  hood; `varchar(50)` adds only a length check you'll someday regret
  (name truncation bugs). House style in most PG shops: `text`, with a
  CHECK constraint if you truly need a limit.
- **numeric vs float for money**: `numeric` is exact decimal arithmetic;
  `float`/`double precision` is binary floating point — 0.1 has no exact
  binary representation, and money drifts. Exercise 2 makes you *watch*
  it drift. `numeric(10,2)` = 10 significant digits, 2 after the point.
- **timestamptz vs timestamp**: lesson 18's paragraph, now as a design
  rule — instants get `timestamptz`; calendar concepts (a coupon's
  validity date!) get `date`.
- **boolean** exists — use it instead of `'Y'`/`'N'` text flags you'll
  find in legacy schemas.
- **Arrays vs join tables**: PostgreSQL happily stores `text[]`. Fine
  for small, closed, order-insensitive lists nobody joins against
  (tags on `products.attributes` could be one). The moment you want
  "which products have tag X, with a FK guaranteeing X exists" — that's
  a join table (next lessons). When in doubt, normalize; arrays are the
  optimization, not the default.

## Exercise 1 — the coupons table

Edit `ex1/solution.sql`. Create `coupons` exactly as specced:

- `code` — text, primary key
- `percent_off` — `numeric(5,2)`, NOT NULL
- `starts_on`, `expires_on` — dates, NOT NULL
- `notes` — text, nullable

Run: `uv run dojo test 24_ddl_and_types ex1`

## Exercise 2 — watch float money break

Edit `ex2/solution.sql`. Two statements:

1. Create `ledger`: `id` int primary key, `amount_float` `double
   precision` NOT NULL, `amount_numeric` `numeric(10,2)` NOT NULL.
2. Insert **ten rows**, each with `0.1` in both amount columns (ids
   1–10; `generate_series` or ten VALUES tuples, your choice).

The gate then asserts `sum(amount_numeric) = 1.00` is **true** and
`sum(amount_float) = 1.0` is **false**. You are inserting the same ten
dimes into both columns; only one column can add them up correctly.
Run it, then try `SELECT sum(amount_float) FROM ledger;` in the lab and
look at the digits you'd have shipped to accounting.

Run: `uv run dojo test 24_ddl_and_types ex2`

## The gate

```python
"""Gates for 24_ddl_and_types. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "coupons", {
        "code": "text",
        "percent_off": "numeric",
        "starts_on": "date",
        "expires_on": "date",
        "notes": "text",
    })
    catalog.assert_pk(lesson_db, "coupons", ["code"])
    catalog.assert_not_null(lesson_db, "coupons", "percent_off")
    catalog.assert_not_null(lesson_db, "coupons", "starts_on")
    catalog.assert_not_null(lesson_db, "coupons", "expires_on")
    catalog.accepts(
        lesson_db,
        "INSERT INTO coupons (code, percent_off, starts_on, expires_on) "
        "VALUES ('WELCOME10', 10.00, '2023-11-01', '2023-12-01')",
        why="a normal coupon, notes omitted (nullable)")


def test_ex2(lesson_db):
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "ledger", {
        "id": "int",
        "amount_float": "double precision",
        "amount_numeric": "numeric",
    })
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM ledger",
        10, "ten rows of 0.10 each")
    grader.assert_scalar(
        lesson_db, "SELECT sum(amount_numeric) = 1.00 FROM ledger",
        True, "numeric: ten dimes make exactly one dollar")
    grader.assert_scalar(
        lesson_db, "SELECT sum(amount_float) = 1.0 FROM ledger",
        False, "float: ten dimes do NOT make a dollar - that's the lesson")
```

## The teaching point

Types are the cheapest correctness tool you will ever get: a `numeric`
column *cannot* accumulate float error; a `date` *cannot* hold "n/a"; a
`boolean` *cannot* hold `'maybe'`. Every validation a type performs is
one your application code — all of it, in every language, forever —
doesn't have to. Schema review is mostly type review; the float-money
table is the canonical catch.

Next: **25_constraints** — promises the database enforces.
