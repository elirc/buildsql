# 54 — Interview drills: the live query round

Lesson 53 was the talking round. This is the other one: a shared screen, a
schema you saw four minutes ago, and somebody saying "okay — show me the
three highest-revenue customers in each country."

There are perhaps six queries that make up almost every hands-on SQL screen
for a data-adjacent engineering role. Top-N per group. A running total or a
month-over-month change. Deduplication down to the latest row per key. A
cohort or retention aggregate. A report that must include the rows where
nothing happened. And one longer composite that is really a test of whether
you can decompose a problem before you start typing. Every drill below is
one of those, written the way an interviewer says it — as a business
request, not a specification — with the exact output columns spelled out
underneath because the gate compares literal rows and a real interviewer
would have answered that question when you asked it.

**Each drill carries a time-box.** Set a timer and honour it. The point is
not to finish inside it; the point is to find out where you actually are,
because "I could have got it with another twenty minutes" is not a thing you
get to say in the room. If the timer runs out, take the hint tier, note that
you took it, and move on — `dojo status` shows hint counts, and a drill you
solved on Hint 2 today is a drill worth redoing next week.

Two habits to practise deliberately while you work these, because they are
scored and the SQL is not the only thing being scored. **Restate the
question before you write** — "so, revenue means the sum of order totals
excluding cancelled orders, and I should return three rows per country even
if two customers tie?" Interviewers grade that as a positive. And **narrate
while you type** — "I'll aggregate to one row per customer first, then rank
inside each country" — because a silent candidate who produces a correct
query scores below a talking one who produces the same query.

## Concept — decomposing out loud

The single most useful move in a live SQL round is refusing to write the
final query first. Almost every drill here is two or three simple queries
stacked, and naming the layers before you type turns a hard problem into
three easy ones.

Take "the three highest-revenue customers per country". Out loud, that is:

```sql
-- layer 1: one row per customer, with their revenue
SELECT c.country, c.id, sum(o.total) AS revenue ...  GROUP BY ...

-- layer 2: number those rows inside each country, best first
row_number() OVER (PARTITION BY country ORDER BY revenue DESC, id)

-- layer 3: keep the first three of each
WHERE rn <= 3
```

Three lines of English, and now the CTE writes itself. The same move works
on every drill below: say what one row of each intermediate result would
look like, and the structure of the query falls out of the description. When
you get stuck mid-drill, it is almost always because two layers got fused —
try to rank and filter in one `SELECT`, or aggregate and compare to the
previous period in one pass, and you will hit an error message that is
really telling you to split it up.

One more thing that costs candidates real points: **make your answer
deterministic**. If two customers tie on revenue, `row_number()` picks one
arbitrarily and the same query returns different rows on different runs.
Every prompt below names its tie-break; put it in both the `OVER (ORDER
BY ...)` and the final `ORDER BY`, and say why you did.

## Exercise 1 — "Top three customers per country" · ⏱ 10 minutes

> *"We're planning regional account reviews. For each country, give me the
> three customers who've spent the most with us. I want the country, the
> customer, and what they spent."*

Edit `ex1/solution.sql`. Spend means `sum(orders.total)` over that
customer's orders **excluding cancelled ones**. Columns, in this order:
`country`, `id`, `name`, `revenue`. Ties on revenue are broken by lower
customer `id` first, and exactly three rows per country.

**Ordered by `country` ascending, then `revenue` descending, then `id`
ascending.** (36 rows — twelve countries, three each.)

Run: `uv run dojo test 54_interview_drills ex1`

## Exercise 2 — "How is revenue trending?" · ⏱ 8 minutes

> *"Monthly revenue for the whole period, and next to each month how much it
> moved from the month before. Don't make me subtract them myself."*

Edit `ex2/solution.sql`. One row per month, using
`date_trunc('month', created_at)` as the month column, summing `total` over
orders that were **not cancelled**. Columns, in this order: `month`,
`revenue`, `change` — where `change` is this month's revenue minus the
previous month's, and is **NULL for the first month** (there is nothing to
compare it to; leave it NULL).

**Ordered by `month` ascending.** (13 rows — the data spans 2022-11 to
2023-11.)

Run: `uv run dojo test 54_interview_drills ex2`

## Exercise 3 — "Their most recent order" · ⏱ 8 minutes

> *"Support is calling our Japanese customers. For every JP customer who's
> ordered, I want their latest order — one row each, no duplicates."*

Edit `ex3/solution.sql`. For each customer with `country = 'JP'`, the single
most recent order. Columns, in this order: `customer_id`, `id`,
`created_at`, `total`. If a customer somehow has two orders at the same
instant, take the one with the higher order `id`.

**Ordered by `customer_id` ascending.** (2,620 rows.)

Run: `uv run dojo test 54_interview_drills ex3`

## Exercise 4 — "Do first-time buyers come back?" · ⏱ 15 minutes

> *"Group customers by the month they placed their first ever order. For
> each of those cohorts, tell me how big it was and how many of them came
> back and ordered again within thirty days."*

Edit `ex4/solution.sql`. A customer's cohort is
`date_trunc('month', <their earliest order's created_at>)`. They count as
returning if they placed **another** order strictly after their first one
and no later than **first order + 30 days**.

Columns, in this order: `cohort_month`, `cohort_size`, `repeat_30d`.

**Ordered by `cohort_month` ascending.** (11 rows.)

Two things decide whether this is right, and interviewers watch for both.
The comparison against the first order must be strict (`>`), or the first
order counts as its own repeat and every cohort is 100% retained. And the
30-day window is measured from **each customer's own first order**, not from
the start of the month — a per-customer window, which is why this is harder
than it sounds.

Run: `uv run dojo test 54_interview_drills ex4`

## Exercise 5 — "The chart needs its empty months" · ⏱ 10 minutes

> *"HR wants sales hiring by month for 2019. Twelve rows — and I mean
> twelve. The last version of this chart just skipped the months where we
> didn't hire anyone, and it made a flat year look like a busy one."*

Edit `ex5/solution.sql`. One row for each of the twelve months of 2019, with
the number of `staff` in the `sales` department whose `hired_on` falls in
that month — **zero included**. Columns, in this order: `month` (the first
day of the month, as a `date`) and `hires`.

**Ordered by `month` ascending.** (12 rows; four of them are zeros.)

The months with no hires do not exist anywhere in `staff`, so no grouping
can conjure them — you have to manufacture the calendar and attach the data
to it. `generate_series` builds the twelve rows; a `LEFT JOIN` attaches the
hires; and then two familiar traps are waiting, both covered in the hints.

Run: `uv run dojo test 54_interview_drills ex5`

## Challenge — the take-home, in 45 minutes (optional, hard)

> *"Build me a one-page country scorecard. Per country: revenue, how many
> orders, how many customers actually bought, average order value, what
> percentage of orders got cancelled, and the name of our single biggest
> customer there. Sort it so the biggest market is at the top."*

Edit `challenge/solution.sql`. This is a realistic 45-minute composite: no
single construct in it is new, and the difficulty is entirely in holding six
definitions straight at once. Read the definitions twice — they deliberately
do not all filter the same way.

Columns, in this order:

| column | definition |
|---|---|
| `country` | the customer's country |
| `revenue` | `sum(o.total)` over that country's **non-cancelled** orders |
| `orders` | count of **all** that country's orders, cancelled included |
| `buyers` | number of distinct customers with at least one order |
| `avg_order_value` | `round(avg(o.total), 2)` over the **non-cancelled** orders |
| `cancel_rate` | `round(100.0 * <cancelled orders> / <all orders>, 1)` |
| `top_customer` | `name` of the customer with the highest non-cancelled spend in that country; ties broken by lower customer `id` |

**Ordered by `revenue` descending.** (12 rows.)

Write `100.0` and not `100` in the cancel rate — integer division would
floor every rate to a whole number, and it is the kind of silent wrongness
this exercise exists to make you feel once. The reference query takes about
fifteen seconds against the full dataset, so budget for that in your timer
rather than assuming your query hung.

Run: `uv run dojo test 54_interview_drills challenge`

## Spaced review

`review1/`: each category's single best-selling product by units sold —
columns `category`, `id`, `name`, `units` (the sum of
`order_items.quantity`), ties broken by lower product `id`, ordered by
`category` ascending. Top-N-per-group with N = 1, which is the form you are
most likely to be handed on a whiteboard.

## The gate

```python
"""Gates for 54_interview_drills. Quoted verbatim in README.md."""
import pytest

from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)

def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex5(shared_lesson_db):
    ex = L.exercise("ex5")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
```

Every gate in this lesson runs the reference query and yours against the
same clone and compares the rows **in order**, because every prompt here
names an ordering — that is what makes them drills rather than puzzles. If
your rows are right but the sequence is wrong, the failure message says so
explicitly rather than dumping a diff, so read the first line before you
start rewriting the query.

## The teaching point

Nobody writes a top-N-per-group query from first principles in an interview.
They write it from memory, because they have written it thirty times, and
the mental effort goes into the parts that are actually specific to the
question — what "revenue" excludes, what happens on a tie, whether the
report needs its empty rows. That is the whole reason this lesson exists as
drills with a clock rather than as more exercises: the shapes have to be
automatic so that your attention is free for the requirements.

The other half of it is the requirements themselves. Look back at the
challenge's definition table — `revenue` excludes cancelled orders, `orders`
counts them, `buyers` counts customers and not orders. In a real interview
that table does not exist; the interviewer says one paragraph and expects you
to ask. The candidates who do well are not the ones who type fastest, they
are the ones who spend the first ninety seconds making the ambiguity go
away, and then write a query that is right the first time.

Next: **`dojo review`**. Both interview lessons ship review variants, so
these shapes come back on the 3 → 7 → 21 → 60-day ladder. Book them into the
week before your interview and they will be warm when you need them.
