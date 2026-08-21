# Reading - 54_interview_drills

Six drills, six shapes, and a clock. What follows is the theory behind each
one — why interviewers reach for it, what they are watching for while you
type, and the specific mistake that costs the offer.

## Notes

**The shapes are the syllabus.** A hands-on SQL screen is not a test of how
much SQL you know; it is a test of whether four or five specific query
shapes are automatic. Top-N per group, running total and period-over-period,
latest-row-per-key, a cohort aggregate, and a report that has to include the
rows where nothing happened. If you can produce each of those from memory,
you have covered the overwhelming majority of what gets asked, and your
attention is free for the part that is actually specific to the question.

**Aggregate first, window second.** Four of the six drills here have the same
skeleton: collapse to the grain the question is about, then use a window
function to compare each of those rows to its neighbours. Monthly revenue
then `lag`. Customer revenue then `row_number`. Getting the grain right is
the whole game — if you find yourself windowing over raw `orders` rows when
the question is about months, you have skipped a layer and the query will
fight you.

**You cannot filter a window function in the same SELECT that computes it.**
Window functions are evaluated after `WHERE` and `GROUP BY` and before
`ORDER BY` and `LIMIT`, so `WHERE rn <= 3` has to live one level out — in
the query that selects from the CTE or subquery where `rn` was computed.
Every top-N-per-group query is two layers for this reason and no other, and
being able to say *why* is worth more than being able to type it.

**Determinism is a requirement, not a nicety.** `row_number()` over a tie
picks arbitrarily, which means the same query can return different rows on
different runs — a bug that survives code review because it passes every
time you run it and fails on the day the data shifts. Add a unique column to
the `ORDER BY` inside the window, and repeat the same ordering in the outer
`ORDER BY`. Every drill in this lesson names its tie-break; in a real
interview, naming it yourself unprompted is the move.

**A report needs the rows where nothing happened.** This is the one people
have never thought about until it bites: months with no hires, days with no
orders, categories with no sales. Those rows are not in the table, so no
`GROUP BY` can produce them. You manufacture the axis with `generate_series`
and `LEFT JOIN` the data onto it — and then remember `count(col)` rather
than `count(*)`, or your empty months report one instead of zero.

**On the clock.** Time-boxes here are deliberately tight-ish. If one runs
out, take the hint and note that you took it; the value of the drill is the
diagnostic, not the pass. A drill you solved on Hint 2 today is exactly the
drill to redo cold in a week — which is what the review ladder is for, and
why this lesson ships a review variant.

## ex1 — top three customers per country

The single most-asked hands-on question, in one variant or another. Two
layers: a `GROUP BY` down to one row per customer with their revenue, then
`row_number() OVER (PARTITION BY country ORDER BY revenue DESC, id)` and
`WHERE rn <= 3` outside it.

What the interviewer is actually watching for is whether you ask what
"spent the most" means before you write it. Does it include cancelled
orders? Here it does not — that is why the prompt says so, and in the room
it is the question you should have asked. The second thing they watch for is
the tie-break: without `, id` in the window's `ORDER BY`, two customers on
identical revenue come back in whatever order the planner produced, and
"whatever the planner produced" is not an answer.

The follow-up to be ready for is "what if I wanted everyone tied for third,
not exactly three?" — that is `rank()` instead of `row_number()`, and being
able to switch between them on request is the point of Q23 in lesson 53's
question bank.

## ex2 — monthly revenue and the change from last month

Aggregate to the grain, then look sideways. `date_trunc('month',
created_at)` with `sum(total)` gives one row per month; `lag(revenue) OVER
(ORDER BY month)` gives that row the previous month's number, and the
subtraction is the answer. This is the query that makes people finally
understand what window functions are *for*: a `GROUP BY` has thrown away the
neighbouring rows by the time you want them, and a self-join on
"month - 1 month" is a mess by comparison.

Leave the first month's `change` as NULL. It is genuinely unknown — there is
no prior month in the data — and `coalesce(..., 0)` there would assert that
revenue was flat, which is a different claim and a false one. Interviewers
notice; "I left it NULL because we have no November 2022 baseline" is a
better sentence than any zero.

The natural follow-up is the percentage version, `round(100.0 * (revenue -
prev) / prev, 1)`, and it comes with two traps worth having ready: integer
division if you write `100` instead of `100.0`, and a division by zero if any
month could have zero revenue — `nullif(prev, 0)` is the guard.

## ex3 — the latest order per customer

Deduplication down to one row per key, asked here as "their most recent
order" but just as often as "remove the duplicates, keep the newest". Rank
inside the partition with `row_number() OVER (PARTITION BY customer_id ORDER
BY created_at DESC, id DESC)` and keep `rn = 1`.

Have the second answer ready, because in a PostgreSQL interview it lands
well: `SELECT DISTINCT ON (customer_id) ... ORDER BY customer_id,
created_at DESC, id DESC` does it in one pass and reads beautifully, at the
cost of being PostgreSQL-only. Lesson 49 is the whole story. The
`ORDER BY` in a `DISTINCT ON` query is not optional decoration — it is what
decides which row survives, which is why the leading column must be the
`DISTINCT ON` key.

The trap here is subtle and worth saying out loud: the tie-break. Two orders
at the same `created_at` and no `id DESC` means an arbitrary winner, and
because collisions are rare it will pass every test you write and then
misbehave in production exactly once a quarter.

## ex4 — do first-time buyers come back?

A cohort aggregate, and the drill in this lesson most likely to eat your
time-box. Three layers: find each customer's first order, label them with
its month, then ask whether they ordered again inside thirty days of *that
customer's own* first order.

The elegant version uses `min(created_at) OVER (PARTITION BY customer_id)`,
which attaches the first-order timestamp to **every** one of that customer's
order rows without collapsing them — so the comparison `created_at >
first_at AND created_at <= first_at + INTERVAL '30 days'` can be evaluated
row by row, then folded up with `bool_or`. That is the window-versus-GROUP-BY
distinction doing real work: a `GROUP BY` would have thrown away the
individual orders you need to test.

Two mistakes to avoid deliberately. Strict `>` on the first comparison, or
the first order matches its own window and every cohort reports 100%
retention — a number so clean it should make you suspicious immediately. And
a fixed calendar window (`first day of the cohort month + 30 days`) is a
*different* metric from a per-customer window; both are legitimate, they
answer different questions, and an interviewer will absolutely ask which one
you implemented.

Do notice the shape of the answer: the November and December 2022 cohorts
are enormous and everything after is tiny. That is an artefact of a synthetic
dataset where the order history starts all at once, not a business insight —
a good reminder to look at cohort sizes before you draw conclusions from
cohort rates.

## ex5 — the report that includes its empty months

The rows you need are not in the database. Four months of 2019 have no sales
hires, so `GROUP BY date_trunc('month', hired_on)` can only ever return
eight rows, and no amount of clever aggregation will produce the other four.
You have to build the axis and attach the data to it — `generate_series`
gives you the twelve months, and a `LEFT JOIN` hangs the hires off it.

Then the two traps, and they are both callbacks. `count(*)` counts the
NULL-extended row and prints **1** for the empty months, because a
NULL-extended row is still a row — `count(s.id)` gives the 0 you want.
And putting `s.department = 'sales'` in the `WHERE` clause instead of the
`ON` clause deletes every NULL-extended row and silently converts your
`LEFT JOIN` back into an inner one, which is lesson 09's entire subject
turning up in an interview eleven lessons later.

There is a second correct shape: aggregate the hires first in a CTE, then
`LEFT JOIN` that onto the calendar and `coalesce(hires, 0)`. It is easier to
reason about, harder to get the join condition wrong, and a perfectly good
thing to say you prefer.

## challenge — the country scorecard

This is the take-home in miniature, and its difficulty is not SQL — it is
holding six definitions straight while you write. `revenue` excludes
cancelled orders, `orders` counts them, `buyers` counts customers rather
than orders, `avg_order_value` averages only the non-cancelled ones. Every
one of those is a place where a plausible query produces a wrong number that
nobody catches, which is precisely why the exercise looks like this.

The structural move is decomposition: one aggregate per country for the
measures, one ranked aggregate per (country, customer) for the top customer,
joined at the end on `country`. Trying to produce the top customer's *name*
inside the same `GROUP BY c.country` is the trap — a name is not an
aggregate of the group, and the moment you notice that, the second CTE
writes itself. `FILTER (WHERE ...)` is what lets the differently-filtered
measures share one pass over the data instead of becoming four subqueries.

Write `100.0`, not `100`. `100 * 4 / 24` is integer division and evaluates
to 16, not 16.7, and the report ships with every cancel rate rounded to a
whole number. It is a one-character bug and it is one of the most common
real-world defects in reporting SQL.

For the follow-up: if this scorecard had to run every fifteen minutes on a
table a hundred times this size, what would you change? The answers are a
materialized view refreshed on a schedule (lesson 46), an index on
`orders.customer_id` so the join stops being a full scan (lesson 33), or
pre-aggregating to a daily summary table and reading that. Having one of
those ready turns a query exercise into an architecture conversation, which
is the conversation more senior candidates get to have.

## review1 — best seller per category

Top-N-per-group with N = 1, which is the version most likely to appear on a
whiteboard because it fits on one. The measure is units — `sum(quantity)`
from `order_items` — not revenue and not the number of orders, and reading
the measure correctly is half of what is being tested.

When it comes round on the review ladder, write it both ways: `row_number()`
with `rn = 1`, and `DISTINCT ON (category)`. Then say which you would ship
and why. Two correct answers plus a stated preference is what fluency sounds
like from the other side of the table, and it takes about ninety seconds
longer than one answer.

## Further reading

- [PostgreSQL — Window Functions Tutorial](https://www.postgresql.org/docs/16/tutorial-window.html) — the gentlest correct explanation of partitions and frames, and where windows sit relative to `WHERE`. Behind ex1, ex2 and ex4.
- [PostgreSQL — SELECT: DISTINCT ON](https://www.postgresql.org/docs/16/sql-select.html#SQL-DISTINCT) — the exact semantics of which row survives, and why the `ORDER BY` is load-bearing. The other answer to ex3.
- [PostgreSQL — Set Returning Functions](https://www.postgresql.org/docs/16/functions-srf.html) — `generate_series` over dates and timestamps, the tool that manufactures the missing rows in ex5.
- [PostgreSQL — Aggregate Expressions and FILTER](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-AGGREGATES) — how `FILTER` restricts one aggregate to a subset of the group, which is what makes the challenge one pass instead of four.
- [Modern SQL — Window functions](https://modern-sql.com/feature/over) — the same material with the standard's history and other engines' quirks, useful when the interviewer's background is not PostgreSQL.
