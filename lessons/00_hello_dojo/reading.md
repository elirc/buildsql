# Reading - 00_hello_dojo

The loop you just ran — write, grade, read the evidence — is the whole
course. This page is the other half of every lesson: the *why* behind the
problems you just solved. It is meant to be read **after** you attempt a
problem, whether the gate went green or red. Failing first and reading
second is not a consolation prize; it is the version of studying that
actually sticks.

## Notes

**Why a real database and not a toy one.** Almost every SQL tutorial runs
against a dozen rows, where every query is instant and every mistake is
invisible. This course runs against 500,000 orders and 3,000,000 events on
purpose. At that size, a missing `WHERE` takes noticeably longer, a missing
index is something you can *feel*, and the difference between a good query
and a bad one stops being an aesthetic opinion. Part 5 depends on this
entirely — you cannot learn to read a query plan on data that fits in a
cache line.

**Why every run gets a fresh clone.** PostgreSQL can create a database
`TEMPLATE another_database`, which copies the files on disk rather than
replaying the data. That is how `dojo test` hands each exercise a private,
pristine copy of a multi-gigabyte database in a second or two. The practical
consequence for you: there is no state to corrupt and no reason to be
careful. Drop a table. Delete every row. `UPDATE` without a `WHERE`. The
next run does not know or care — and deliberately breaking things is one of
the fastest ways to learn what a constraint or a transaction is actually for.

**Why the gate is quoted in every README.** Being graded by a program you
cannot read is how people learn to game a test instead of learning the
subject. Every lesson prints its own grader at the bottom, verbatim. When
you are stuck, reading the gate is legitimate and often the fastest route to
understanding what the question is really asking — is order being compared?
is the plan being inspected? is it timing me?

**A note on determinism.** The dataset is generated from a fixed random seed
with fixed timestamps and no `now()` anywhere. Customer 4242 has the same six
orders on your laptop as on anyone else's. That is what lets the lessons cite
exact numbers, and it is why `docs/dataset_facts.md` is worth a bookmark.

## ex1 — running someone else's query

The instruction to run the gate *before* pasting the answer is the real
exercise. A test suite you have only ever seen pass teaches you nothing; the
failure output is the interface you will actually use for the next fifty
lessons. Read it once, deliberately: it shows the rows the reference query
produced, the rows yours produced, and a one-line diagnosis of the
difference. Every failure in this course is written to teach rather than to
scold, and the ones in Part 5 will show you an entire query plan.

## ex2 — your first solo query

Two ideas arrive at once. `*` means "every column of the row", and it is a
convenience for humans at a console, not a thing to ship. `WHERE id = 4242`
is a *filter*: it is evaluated once per row, and keeps the row only when the
result is true. Filtering is conceptually independent of which columns you
select — SQL lets you describe *what* you want without describing *how* to
find it, and the planner decides the how. That separation is the whole
premise of the language.

## ex3 — the same shape, a different table

Transfer is the point. The query differs from ex2 in exactly two tokens, and
the result differs in shape because `customers` has five columns and
`products` has six. If you predicted "six columns" out of habit, notice
that: most SQL bugs in production are a correct query pointed at the wrong
assumption about the data.

## ex4 — asking for less

`SELECT *` in application code is the most common smell in SQL review. It
drags columns across the network that nobody reads (`products.description`
is a paragraph of marketing text), it makes the result shape depend on
unrelated schema changes, and — the part that bites in Part 5 — it makes an
*index-only scan* impossible, because the index cannot possibly contain
every column. Lesson 34 will make that concrete. For now: name your columns.

## Further reading

- [The SQL Language — a first query](https://www.postgresql.org/docs/16/tutorial-select.html) — the official five-minute version of what you just did.
- [`SELECT` reference page](https://www.postgresql.org/docs/16/sql-select.html) — dense, and the single most useful page in the docs. Skim it now; you will return to it for the rest of your career.
- [`CREATE DATABASE ... TEMPLATE`](https://www.postgresql.org/docs/16/manage-ag-templatedbs.html) — how `dojo test` gives you a pristine multi-gigabyte database per run.
- [Don't Do This](https://wiki.postgresql.org/wiki/Don%27t_Do_This) — the PostgreSQL wiki's list of things that look reasonable and are not. Worth ten minutes now and another ten after Part 4.
