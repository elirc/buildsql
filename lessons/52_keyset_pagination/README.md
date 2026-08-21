# 52 — Keyset pagination

> **Part 8 — Optimization patterns (bonus).** The second of the two
> post-course lessons on optimization that isn't DDL. Lesson 51 rewrote
> queries the index couldn't serve; this one rewrites the query that gets
> *slower every page*. The gate machinery has one twist you should notice
> immediately: the lesson's `setup.sql` holds the indexes these tables
> already have, and **the gate applies it before it measures the baseline.**
> The naive query is timed with exactly the index your rewrite gets, so
> nothing here is a disguised repeat of lesson 31.

Lesson 03 told you that `OFFSET` does not skip work, it discards it — and
then had you use it anyway, because on page 3 of a catalogue nobody can
tell. Here is the bill. `events` holds 3,000,000 rows, one per second, from
2023-10-11 04:53 to 2023-11-14 22:13. An export job walks it 20 rows at a
time. Page 1 costs 20 rows. Page 10,001 costs 200,020 rows, of which the
job keeps twenty and the database throws away 200,000 — every one of them
read, every one of them ordered, all of it work the job already did on the
previous ten thousand pages.

That is the shape of every "why does our admin UI get slower as you scroll"
ticket ever filed. It is not a missing index: with a perfect index on the
sort column, page 10,001 is still a walk of 200,020 index entries. It is
not a slow disk. It is `OFFSET` doing exactly what it is specified to do,
linearly, forever.

And it is not only slow — it is *wrong*. `OFFSET` counts positions in a
result set that is recomputed for every request. Insert one row above the
boundary between requests and every later row shifts down a slot: the user
sees an item twice, or never sees it at all. Deleting one shifts them the
other way. A pagination scheme that is defined by counting is only correct
if the data holds still, and production data never does.

## Concept

The fix is to stop describing a page by *how many rows precede it* and
start describing it by *where it starts*. You already know where it starts:
the client just received the previous page, and the last row on it carries
the sort key. Send that key back, and the next page is a range query.

```sql
-- OFFSET: "skip 40,000 rows, then give me 20" - linear in the page number
SELECT id, created_at FROM customers
ORDER BY created_at, id
OFFSET 40000 LIMIT 20;

-- keyset: "give me the 20 rows after this one" - one descent, 20 entries
SELECT id, created_at FROM customers
WHERE (created_at, id) > (TIMESTAMPTZ '2023-04-01 09:15:00+00', 31234)
ORDER BY created_at, id
LIMIT 20;
```

This is called **keyset pagination** (also seek, or cursor pagination). Three
things make it work, and all three are load-bearing:

**1. An index that matches the `ORDER BY`.** The whole trick is that
PostgreSQL can descend the B-tree to the cursor and then read forward. An
index in a different order turns the query back into a sort of everything.

**2. A `WHERE` on the bare sort key.** Lesson 51's rule applies unchanged:
`WHERE (a, b) > (x, y)` is a range the index can seek; anything that wraps
the columns in a function is not.

**3. A sort key that is unique.** `(created_at, id)` above ends in the
primary key on purpose. If the cursor is `created_at` alone and three rows
share that timestamp, then `WHERE created_at > cursor` skips the other two
forever, and `WHERE created_at >= cursor` shows one of them twice. An
ambiguous `ORDER BY` is a *correctness* bug in pagination, not a style
preference — which is why the professional habit is to append the primary
key to every pagination sort, even when ties look unlikely.

`(a, b) > (x, y)` is a **row-value comparison**, and it means exactly what
`ORDER BY a, b` means: `a > x`, or `a = x` and `b > y`. Written as one
comparison rather than that `OR` by hand, PostgreSQL can use it as a single
index condition — the hand-written version usually can't be.

The cost, and it is a real one: keyset pagination gives you "next" and
"previous", not "jump to page 4,000". There is no page number in it. Most
product surfaces — infinite scroll, activity feeds, export jobs, cursor
APIs — never needed one.

## Exercise 1 — feel the cliff

`ex1/solution.sql` (provided — this is the slow query, rewrite it):

```sql
SELECT id, ts
FROM events
WHERE ts >= TIMESTAMPTZ '2023-11-11 12:00:00+00'
ORDER BY ts
OFFSET 200000
LIMIT 20;
```

An export job walking the event log oldest-first from noon on November 11
(296,001 rows), 20 to a page, currently on **page 10,001**. The index it
wants already exists — `setup.sql` provides `events (ts, id)` and the gate
applies it before it times anything — and the plan is still an
`Index Only Scan` that reads **200,020 entries to return 20**.

The job holds the last row of page 10,000: its `ts` is
**2023-11-13 19:33:19+00**. Rewrite the query as a keyset seek from that
cursor. Same 20 rows, same order, columns `id` and `ts`, and the order is
graded.

Run: `uv run dojo test 52_keyset_pagination ex1`

## Exercise 2 — the tiebreak is not optional

Edit `ex2/solution.sql`. The catalogue browser lists all 10,000 products
ordered by `category`, then `id`, 20 per page, and you are building **page
2** — columns `id`, `category`, `name`, exactly 20 rows, ordered.

The stub already contains the cursor: a CTE named `last_seen` holding the
last row of page 1, which is what the "next page" link would have carried.
Write the page-2 query using it.

The trap is in the data. There are 1,678 books, and `books` sorts first, so
pages 1 and 2 are both well inside a single category — a cursor that
remembers `category` alone can only say "after all books", which skips
1,658 of them and serves the reader something from eighty pages further
down. This is the ties problem from the Concept section with the numbers
filled in, and no index and no clock are involved: the naive version here is
*fast and wrong*, which is the more expensive kind of bug.

Run: `uv run dojo test 52_keyset_pagination ex2`

## Exercise 3 — newest first

`ex3/solution.sql` (provided — rewrite it):

```sql
SELECT id, ts
FROM events
ORDER BY ts DESC
OFFSET 200000
LIMIT 20;
```

The same log, read the way a UI reads it: newest first, 20 to a page, page
10,001. Same index — `setup.sql`'s `events (ts, id)` serves both directions,
because a B-tree is walked either way, and the plan will say `Backward`. The
last row of page 10,000 has `ts` = **2023-11-12 14:40:01+00**.

Rewrite it as a keyset seek. The direction change is the whole exercise:
one operator moves, and if you move it the wrong way the query returns the
page the user just read. Columns `id`, `ts`; the order is graded.

Run: `uv run dojo test 52_keyset_pagination ex3`

## Exercise 4 — a filtered feed needs its own index

`ex4/solution.sql` is provided and **already correct** — leave it alone.
This time you write `ex4/indexes.sql`.

```sql
SELECT id, ts, event_type
FROM events
WHERE customer_id = 4242
  AND ts > TIMESTAMPTZ '2023-10-20 00:00:00+00'
ORDER BY ts
LIMIT 20;
```

One customer's activity feed, keyset-paged exactly as ex1 taught, and it
takes hundreds of milliseconds to return 20 of customer 4242's 65 events.
The same `setup.sql` feed index is in place before the baseline is measured,
so this is not a lesson about having no index; it is a lesson about having
the *wrong* one. Ordering by `ts` is only half the query's contract, and the
half that index serves is the cheap half.

Build the index that serves both halves. The gate forbids `Seq Scan` and
`Sort`, which between them rule out every near-miss: an index that only
finds the customer still has to sort what it finds.

Run: `uv run dojo test 52_keyset_pagination ex4`

## Challenge — walk three pages without dropping a row (optional)

Edit `challenge/solution.sql`. The review wall shows the highest-rated
reviews first — `ORDER BY rating DESC, id DESC`, 20 per page. Produce
**pages 1, 2 and 3 as one 60-row result**, columns `id` and `rating`,
ordered, with each page chained to the last row of the page before it. The
gate compares your 60 rows against a plain `ORDER BY rating DESC, id DESC
LIMIT 60` — nothing skipped, nothing repeated, in order.

`challenge/indexes.sql` provides `reviews (rating DESC, id DESC)`, so every
page is a seek rather than a sort of a million rows.

Difficulty note: the SQL is not hard — three CTEs and a `UNION ALL` — but
two details bite. Getting the cursor *out* of a page means asking for that
page's smallest key, which in a descending feed is its last row. And with
199,504 reviews rated 5, all 60 rows here carry the same rating: a cursor
that forgets the `id` half does not go slightly wrong, it goes 199,504 rows
wrong.

Run: `uv run dojo test 52_keyset_pagination challenge`

## The gate

```python
"""Gates for 52_keyset_pagination. Quoted verbatim in README.md.

Part 8's inversion, sharpened: setup.sql's feed index is applied *before* the
baseline is measured, so the naive OFFSET query is timed with exactly the
index your rewrite gets. What the clock compares is the pagination technique
and nothing else. Exercise 4 is the deliberate exception - there the missing
index is the whole problem, and it is yours to write.
"""
import pytest

from dojo import grader, timing
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    L.apply_setup(lesson_db)             # the feed index, applied before the clock
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    # No clock and no index here: a missing tiebreak does not make a page
    # slow, it makes it wrong. 10,000 products are enough to prove that.
    ex = L.exercise("ex2")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    L.apply_setup(lesson_db)
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex3",
                                      ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex4(lesson_db):
    # Same setup.sql, same order - and this time the feed index buys the
    # baseline nothing, because the query filters as well as sorts. Your
    # index goes in ex4/indexes.sql; the query is provided and does not change.
    ex = L.exercise("ex4")
    L.apply_setup(lesson_db)
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex4",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


@pytest.mark.challenge
def test_challenge(lesson_db):
    # Correctness only: sixty rows, nothing skipped, nothing repeated, in
    # order. The provided index keeps each page a seek instead of a sort.
    ex = L.exercise("challenge")
    ex.apply_indexes(lesson_db)
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
```

Read the order of the stages in ex1 and ex3: `apply_setup` comes first, so
the `OFFSET` query whose time becomes your baseline is running on the same
`events (ts, id)` index your rewrite uses. Then your rows must match the
reference's **in order** (pagination that returns the right rows in the
wrong order is broken), the plan must contain no `Seq Scan` and no `Sort`
(you seeked; you did not scan and re-sort), and the clock must show at least
**8x**. The measured difference is far larger than 8x — the gate is loose on
purpose, because the ratio grows with the page number and shrinks on a busy
machine, and the technique is what is being graded.

Exercise 4 adds one line: after the same `apply_setup`, `apply_indexes` —
your file this time — runs once the baseline is already recorded. Exercise 2
and the challenge drop the plan and the clock entirely and compare rows
only; nothing they teach is about speed.

## The teaching point

Every pagination bug in production is one of these two, and they arrive
together. The slow one is `OFFSET` on a deep page: linear cost the user pays
for scrolling, invisible in development where page 3 is as deep as anyone
goes. The wrong one is an ambiguous `ORDER BY`: rows that duplicate or
vanish between pages, reported as "flaky", reproducible only against
production-shaped data.

Both dissolve into the same discipline. Sort by something unique — append
the primary key if you have to. Index the thing you sort by, together with
whatever you filter by, in that order. Then page by *where you are*, not by
*how far you have counted*. `WHERE (key) > (cursor) ORDER BY key LIMIT n` is
constant time on page 1 and on page 10,001, and it stays correct while rows
are being inserted underneath it.

Next: **53_interview_concepts** — Part 9 turns the whole course into
questions, and this lesson answers two of them.
