# 30 — Reading EXPLAIN

Welcome to Part 5. Everything you've written so far was graded on *what*
it returned; from here on, the dojo also grades **how** the database got
it, and how fast. The instrument for all of it is `EXPLAIN` — and the
skill that separates "I added an index and prayed" from actual
performance work is *reading plans fluently*.

Two new commands become your daily drivers:

- `dojo plan <lesson> [ex]` — EXPLAIN your current `solution.sql`
  (applying your `indexes.sql` first), rendered as a tree. No gate.
- `dojo lab <lesson>` — your sandbox, now the place you run
  `EXPLAIN ANALYZE` by hand.

## Concept

```sql
EXPLAIN SELECT * FROM orders WHERE total > 1999;             -- estimates only
EXPLAIN ANALYZE SELECT * FROM orders WHERE total > 1999;     -- actually runs it
```

`EXPLAIN` shows the plan the optimizer chose with **estimated** costs and
row counts. `EXPLAIN ANALYZE` executes the query and adds **actual** rows
and time per node. The estimated-vs-actual gap is diagnostic gold (lesson
36 is entirely about it).

A plan is a tree, executed leaves-first:

```
Sort  (rows=250, 91.2ms)
  Seq Scan on orders  (rows=250, 88.1ms)   <-- most expensive
        Filter: (total > 1999)
        Rows Removed by Filter: 499750
```

How to read any plan, in order of importance:

1. **Node types.** `Seq Scan` = read every row of the table. `Index
   Scan` = walk an index to the matching rows. There are ~a dozen more;
   Part 5 introduces them one per lesson.
2. **Actual rows per node** — the data volume flowing up the tree. A
   node that reads 500,000 rows to feed a node that outputs 11 is the
   waste you'll learn to eliminate.
3. **loops** — a node's figures are *per loop*; a nested inner side
   executing 500,000 times multiplies. (Lesson 37.)
4. **Buffers** (`EXPLAIN (ANALYZE, BUFFERS)`) — pages touched: the
   physical-I/O truth behind the milliseconds.

"Rows Removed by Filter: 499,750" is the single most valuable line for
index hunting: it means the executor *fetched and threw away* half a
million rows. An index's entire job is making that number small.

## Exercise 1 — name that node

Run this in the lab (`dojo lab 30_reading_explain`):

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE total > 1999;
```

Edit `ex1/solution.sql` to return **one row, one column**: the node type
that reads the table, exactly as EXPLAIN spells it. Answer with a SQL
literal — `SELECT '<your answer>';`.

Run: `uv run dojo test 30_reading_explain ex1`

## Exercise 2 — read three facts from one plan

In the lab, run:

```sql
EXPLAIN ANALYZE SELECT count(*) FROM orders WHERE status = 'paid';
```

Edit `ex2/solution.sql` to return one row with three literal columns:

1. the **actual** number of rows the scan node emits after filtering
   (the `rows=` of the scan node, an integer),
2. the scan node's type (text, exact spelling),
3. whether any index was used (`true`/`false`).

Sanity-check column 1 against `dataset_facts.md` before answering.

Run: `uv run dojo test 30_reading_explain ex2`

## Exercise 3 — name the sort method

Run this in the lab (`dojo lab 30_reading_explain`):

```sql
EXPLAIN ANALYZE
SELECT id, name, price FROM products ORDER BY price DESC LIMIT 10;
```

Look at the `Sort` node. Underneath the node line, PostgreSQL prints a
`Sort Method:` line naming the algorithm it actually used. Edit
`ex3/solution.sql` to return that method as a single text value — for
example `SELECT 'quicksort';` if that were the answer.

The answer is worth understanding rather than copying. PostgreSQL notices
`ORDER BY ... LIMIT n` and switches to an algorithm that keeps only the
best n rows in memory instead of sorting all 10,000 — a large constant
factor saved, but still a full pass over the table, because every row must
be examined to know it is not in the top ten. Lesson 35 removes the pass
entirely.

Run: `uv run dojo test 30_reading_explain ex3`

## Exercise 4 — name the join algorithm

In the lab, run:

```sql
EXPLAIN
SELECT c.country, sum(o.total)
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.country;
```

This is lesson 08's revenue-by-country query. Find the node that performs
the join and edit `ex4/solution.sql` to return its node type as a single
text value, spelled exactly as the plan spells it.

PostgreSQL has three join algorithms and it chose this one because it
needs every row of both tables and there is no index on
`orders.customer_id` to walk. It builds a hash table from the smaller
input and streams the larger one past it. Lesson 37 is about all three and
about what would make the planner change its mind.

Run: `uv run dojo test 30_reading_explain ex4`

## The gate

```python
"""Gates for 30_reading_explain. Quoted verbatim in README.md."""
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

(Still plain correctness gates — reading comes before optimizing. The
three-stage performance gate debuts next lesson.)

## The teaching point

Professionals don't guess at performance, and they don't cargo-cult
indexes; they read the plan, find the node where volume or loops
explode, and fix *that*. Every remaining lesson is one recurring plan
pathology and its cure. Learn to see the pathology first — the cure is
usually one line.

Next: **31_first_index** — your first CREATE INDEX, and an 8x gate.
