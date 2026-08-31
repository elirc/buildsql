# Reading - 69_drills_aggregates_3

Eight drills on conditional aggregation and counting things that may not be
there. Read after your attempt.

## Notes

A KPI row is a single `SELECT` in which every column is an aggregate over a
different slice of the same scan, and `FILTER (WHERE ...)` is what makes that
possible: the query reads the table once and each number decides for itself
which rows it wants. Two things keep such a row honest. First, be explicit
about which counting question each column asks - rows, non-NULL values, or
distinct values - because on a joined result all three differ, and
`count(DISTINCT c.id)` is often the only one that means "customers". Second,
remember that an aggregate over no matching rows returns NULL rather than
zero for everything except `count`, so any figure that must read as 0 needs
`coalesce` on the outside. Ratios need the same care they always did: promote
to numeric before dividing, and round once, at the end.

## ex1 - the order KPI row

This is the shape of nine out of ten summary queries in a real reporting
codebase: one table, one scan, several `FILTER`ed aggregates, and a grand
total that must not be filtered. The classic mistake is putting the first
condition in `WHERE` because it feels natural, which quietly turns the final
`count(*)` into a count of paid orders. Model answer: `WHERE` describes the
report's population, `FILTER` describes one column's population, and here the
report's population is everything.

## ex2 - the staff KPI row

Five aggregates over five different ideas - a total, a central tendency, an
extreme, a boundary date, and a data-quality count - which is roughly the
anatomy of every "state of the table" query. The last column is the one worth
practising both ways, because `count(*) - count(col)` is the idiom that tells
you how many values are missing without a FILTER, and it generalises to any
column you suspect of being sparse.

## ex3 - a histogram in a single row

This is a pivot done by hand, and it is the honest way to do one in
PostgreSQL: the set of output columns is fixed at write time, so the values
must be known in advance - here, ratings 1 to 5. That is the essential
limitation of pivoting in SQL, and the reason lesson 17 spends its time on it
rather than on syntax. The classic mistake is expecting a `GROUP BY` to
produce columns; it produces rows, and turning rows into columns is a
different operation. The self-check in Hint 2 is the habit worth keeping.

## ex4 - extremes and how many values there are

Two aggregates can be combined arithmetically in the SELECT list because both
have already collapsed to scalars - this is the same reason `sum(a) /
sum(b)` works and `sum(a) / b` does not. The third column is the interesting
one: comparing distinct values against row count is how you find out whether
a column behaves like an identifier, a category, or a measurement. The
classic mistake is `count(DISTINCT *)`, which is not valid syntax; DISTINCT
inside an aggregate applies to one expression.

## ex5 - counting people, not orders

Counting people rather than events is the difference between "we processed
half a million orders" and "we served forty-five thousand customers", and
`count(DISTINCT customer_id)` with a `FILTER` is the whole technique. The
classic mistake is assuming the segments partition the customer base and
building a pie chart out of overlapping counts. Model answer: distinct
counting per segment, and a sentence in the report saying the segments
overlap.

## ex6 - ratios between aggregates

Per-entity ratios are the most-quoted numbers in any business review and the
easiest to compute wrongly, because the numerator and the denominator count
different things: rows over distinct values. The type rule bites here too -
`count(*) / count(DISTINCT ...)` is integer division and returns 11 where the
truth is 11.121. The classic mistake is rounding an already-truncated
integer and believing the trailing zeros. Model answer: cast once, divide
once, round once.

## ex7 - review health for one category

The first drill in this set where `count(*)` and `count(DISTINCT ...)` count
genuinely different things: after a join, one row is one review, so the row
count is reviews and the distinct count is products. Getting that wrong turns
"1,666 products" into "166,000 products" and nobody notices, because both
numbers are plausible. The classic mistake is filtering on the joined table
in the `ON` clause here - harmless for an inner join, but a habit that
becomes a bug the moment somebody changes it to a LEFT JOIN.

## ex8 - customers who never bought

Every counting rule in this lesson meets at once here. On a left-joined
result `count(*)` counts join rows (orders, plus one phantom per customer
with none), `count(o.id)` counts real orders, `count(DISTINCT c.id)` counts
customers, and `count(DISTINCT o.customer_id)` counts buyers - four different
numbers from one result set. The classic mistake is moving the country filter
into the `ON` clause, which keeps every customer in the world in the result
and inflates the denominator. Model answer: filter the preserved side in
`WHERE`, count each thing with the aggregate that means it, and `coalesce`
the sum so an empty segment reads as 0 rather than blank.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - the whole table, plus the note that every aggregate but `count` returns NULL over an empty input.
- [`FILTER` explained](https://modern-sql.com/feature/filter) - conditional aggregation before and after the FILTER clause existed.
- [Joins Between Tables](https://www.postgresql.org/docs/16/tutorial-join.html) - the outer-join semantics that exercise 8 aggregates over.
- [Date/Time Functions](https://www.postgresql.org/docs/16/functions-datetime.html) - `min`/`max` on timestamps and dates, used in the staff KPI row.
