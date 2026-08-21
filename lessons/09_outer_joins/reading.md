# Reading - 09_outer_joins

An inner join answers "which rows go together?". An outer join answers the
much more valuable question "which rows *don't*?" — and the entire
difficulty of outer joins comes from the NULLs it invents to say so.

## Notes

**`LEFT JOIN` keeps every left row and manufactures NULLs.** Where no right
row matches, PostgreSQL emits the left row once with every right-side column
set to NULL. Those NULLs are not in the data; the join created them. Once
you internalise "the NULL means *no match existed*", the rest of this lesson
is mechanical.

**The anti-join idiom.** `LEFT JOIN ... WHERE right.key IS NULL` returns
exactly the left rows with no match, because a genuine match can never have
a NULL key. Test the right table's **key** column — a nullable data column
would be NULL for real matches too, and the query would be wrong in a way
that looks right. `NOT EXISTS` (lesson 13) expresses the same idea more
directly and is usually clearer; both plan well in PostgreSQL, which
recognises the pattern and executes it as a genuine anti-join.

**`ON` versus `WHERE` — the distinction that finally bites.** The logical
order is: build the joined rows using `ON`, NULL-extend the unmatched left
rows, *then* apply `WHERE`. So:

- A right-table condition in **`ON`** decides which right rows count as
  matches. Unmatched left rows still appear, NULL-extended.
- The same condition in **`WHERE`** runs after NULL-extension. Since
  `NULL = 5` is unknown and `WHERE` keeps only `true`, every NULL-extended
  row is deleted — and your `LEFT JOIN` has become an `INNER JOIN` with extra
  steps.

This is the single most common outer-join bug in the wild, and it is
invisible: no error, no warning, just a report whose "customers with no
orders" line has been empty for six months. When reviewing a `LEFT JOIN`,
read the `WHERE` clause hunting for right-table columns. Each one is a bug
until proven otherwise — the exception being a deliberate `IS NULL` test,
which is the anti-join.

**`count(*)` versus `count(col)` over an outer join.** A NULL-extended row
is still a row, so `count(*)` returns 1 for a group with no matches at all.
`count(right.id)` returns 0, because `count(column)` skips NULLs. This is
lesson 06's distinction and it is not a corner case — "how many of X does
each Y have, including the zeroes" is one of the most common reports there
is, and getting 1 instead of 0 is a bug nobody spots in a spreadsheet.
The same applies to `sum`: `sum(right.amount)` over no matches is NULL, not
0, so wrap it — `coalesce(sum(r.amount), 0)`.

**`RIGHT` and `FULL`.** `RIGHT JOIN` is `LEFT JOIN` with the tables written
in the other order; most teams standardise on `LEFT` so the preserved side
is always the one you read first. `FULL JOIN` keeps unmatched rows from both
sides and is the tool for reconciliation — comparing two systems' records
and listing what each one has that the other does not.

**Outer joins constrain the planner.** An inner join can be reordered
freely; `A LEFT JOIN B` cannot always be. That is why a chain of left joins
sometimes plans worse than the equivalent inner joins, and why replacing an
unnecessary `LEFT JOIN` with an `INNER JOIN` occasionally produces a
dramatic speedup. Something to remember in Part 5.

## ex1 — who never bought anything?

5,003 customers out of 50,000 — ten percent of the customer base, completely
invisible to every inner-join report. The commercial value of an outer join
is concentrated in questions like this one: churn, dead stock, unconverted
signups, orphaned records. They are all the same query.

## ex2 — dead stock

300 products that have never been ordered. Same pattern, other direction.
Worth noticing that the anti-join answers the question *exactly* — no
approximation, no "probably" — which is why it is the standard tool for
reconciliation jobs.

Three percent of the catalogue has never sold a single unit. In a real shop
that number drives decisions — delisting, repricing, a merchandising review —
and it is completely invisible to every report built on inner joins, because
the rows simply are not there to be counted. The most valuable thing an
outer join produces is often a row that does not exist anywhere else.

## ex3 — counting things that might not exist

The `count(r.id)` trap, live. Write it with `count(*)` in the lab and look
for products reporting exactly 1: those are the ones with zero reviews. The
bug produces plausible numbers, which is the worst kind.

Also note where the category filter went. `p.category` is a **left**-table
column, so `WHERE` is correct and moving it into `ON` would be wrong in the
other direction — it would keep every product in the database and simply
stop matching reviews for the ones outside `toys`.

## ex4 — a filter that belongs in ON

The reason the lesson exists. Two queries, one word moved, wildly different
answers:

```sql
LEFT JOIN reviews r ON r.product_id = p.id AND r.rating = 5   -- ~1,635 rows
LEFT JOIN reviews r ON r.product_id = p.id WHERE r.rating = 5 -- only reviewed ones
```

The second one is not "a bit different" — it has silently answered a
different question, and the missing rows are precisely the ones the report
was commissioned to find.

## challenge — ON vs WHERE, felt in your hands

The same distinction on the customer side, with a left-table filter
(`country`) and a right-table filter (`total`) in the same query — one in
`WHERE`, one in `ON`. Being able to say, for each condition, *which table it
constrains and therefore where it goes* is the skill. Everything else about
outer joins follows from it.

## review1 — Japanese customers with zero orders

The anti-join with an extra left-table filter. When it returns, write it
once more as `NOT EXISTS` for comparison — by then lesson 13 will have
introduced it.

Check one thing while you are there: the country filter is on `customers`,
the left table, so it belongs in `WHERE` and the anti-join still works. Had
the filter been on `orders` — "Japanese customers with no orders *over
1900*" — it would have had to move into the `ON` clause, and the query would
mean something quite different. Left-table filter, right-table filter: the
question to ask of every condition in an outer join.

## Further reading

- [Joined Tables — outer joins](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the formal description of `LEFT`/`RIGHT`/`FULL` and the exact point at which NULL-extension happens relative to `WHERE`.
- [Subquery Expressions — `EXISTS`](https://www.postgresql.org/docs/16/functions-subquery.html) — the other idiomatic anti-join, and why it shrugs off NULLs. Preview of lesson 13.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) — re-read the `count` entry with outer joins in mind: `count(*)` versus `count(expression)` is the whole of ex3.
- [Use The Index, Luke — Joins](https://use-the-index-luke.com/sql/join) — why an outer join restricts join-order freedom, and what that costs.
