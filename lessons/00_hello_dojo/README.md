# 00 — Hello, Dojo

Welcome. This course teaches you SQL by making you write it — every line,
yourself, against a real PostgreSQL database with millions of rows in it.
Nothing here autocompletes, autocorrects, or writes queries for you. You type
SQL into a file, you run a command, and an automated gate tells you whether
your answer is right — and if it isn't, it shows you evidence: the rows it
expected, the rows you produced, and what to reconsider.

This first lesson has one job: prove your toolchain works and teach you the
gameplay loop you'll repeat 47 more times.

## The loop

Every lesson lives in a directory like this one. Inside you'll find:

- `README.md` — the lesson. Read it top to bottom.
- `ex1/`, `ex2/`, ... — one directory per exercise. You edit
  `exN/solution.sql` and nothing else.
- `test_lesson.py` — the gate. You never edit it, but you should read it;
  it's quoted at the bottom of every README so you always know exactly what
  is being checked.

The commands you'll live in:

```
uv run dojo test 00_hello_dojo        # grade this lesson
uv run dojo test 00_hello_dojo ex2    # grade just one exercise
uv run dojo hint 00_hello_dojo ex2    # stuck? reveal the next hint tier
uv run dojo status                    # the big progress dashboard
uv run dojo next                      # what should I work on?
```

Every graded run happens against a **fresh clone** of a template database.
You cannot break anything. Drop a table, fill it with garbage — the next run
gets a pristine copy.

## The database

The dataset is a small e-commerce shop: 50,000 customers, 10,000 products,
500,000 orders, a million order line-items, a million product reviews, three
million clickstream events, and a 500-person staff table. Read
[docs/dataset.md](../../docs/dataset.md) now — five minutes there saves you
an hour of guessing later. Exact numbers live in
[docs/dataset_facts.md](../../docs/dataset_facts.md), regenerated from the
real data every time you seed.

## Exercise 1 — run a query someone else wrote

Just this once, the answer is given to you. Copy the query below into
`ex1/solution.sql`, replacing the `SELECT 1;` placeholder:

```sql
SELECT count(*) FROM customers;
```

Then run:

```
uv run dojo test 00_hello_dojo ex1
```

Before you paste it in, run the gate once with the file as shipped. Watch it
fail. That failure output — expected rows vs. your rows — is the shape of
every failure you'll see in this course. Get comfortable reading it.

## Exercise 2 — your first solo query

Edit `ex2/solution.sql`. The shop wants to see **everything about product
4242**: every column of the `products` table, for the single row whose `id`
is 4242.

You haven't been taught `WHERE` yet — that's lesson 02 — but you need one
tiny preview of it here: appending `WHERE id = 4242` to a `SELECT` keeps only
the rows where the `id` column equals 4242. To select every column, SQL has
the shorthand `*`.

Required output: all six columns of `products` (`id`, `name`, `category`,
`price`, `description`, `attributes`), one row. Ordering doesn't matter (one
row can't be out of order).

```
uv run dojo test 00_hello_dojo ex2
```

## Exercise 3 — the same trick, a different table

Edit `ex3/solution.sql`. Return **everything about customer 4242**:
every column of the `customers` table, for the single row whose `id` is
4242.

Same two ideas as ex2 — `*` for all columns, `WHERE id = ...` for one row —
applied to a table with a different shape. Five columns come back this time
(`id`, `name`, `email`, `country`, `created_at`), not six. Predict the
column *count* before you run it; being surprised by the shape of your own
result is the habit this course is trying to break.

Run: `uv run dojo test 00_hello_dojo ex3`

## Exercise 4 — ask for less

Edit `ex4/solution.sql`. Product 4242 again — but this time return only
two columns, `name` and `price`, in that order.

`*` is convenient and almost always wrong outside a scratch console: it
couples whatever reads your query to columns it never asked for, and it
quietly changes shape the day someone adds a column. Naming your columns is
the default habit; lesson 01 is entirely about it.

One row, two columns.

Run: `uv run dojo test 00_hello_dojo ex4`

## The gate

This is the entire test file for this lesson. Every lesson README shows you
its gate like this — the grader is never a mystery:

```python
"""Gates for 00_hello_dojo. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

In plain English: each test loads your `solution.sql`, runs it against a
fresh clone, runs the reference query in `expected.sql` against the same
clone, and asserts your rows equal the expected rows.

## The teaching point

Real database work has this same loop: write a query, run it, compare what
came back against what you *believed* should come back. The discipline of
predicting the output before you run — and treating a mismatch as
information, not annoyance — is the core skill. The dojo just makes the loop
honest by automating the comparison.

Next: **01_select_basics**, where you start writing real SELECTs.
