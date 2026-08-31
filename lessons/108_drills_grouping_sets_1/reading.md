# Reading - 108_drills_grouping_sets_1

Eight drills on multi-level aggregation. Read after your attempt, pass or
fail.

## Notes

All three constructs are shorthand for the same thing: a *union of
groupings* computed in one pass. `GROUPING SETS` lists the groupings
explicitly; `ROLLUP (a, b)` expands to the hierarchy `(a,b), (a), ()`;
`CUBE (a, b)` expands to every subset. Choosing between them is choosing
which rows you owe the reader - and nothing else, which is why every
exercise here can also be written as a UNION ALL of ordinary GROUP BYs (the
references do exactly that, at the price of scanning the data once per
grouping). The one genuinely new concept is the subtotal NULL: rolled-up
columns read NULL, that NULL is indistinguishable from a real one in the
data, and `GROUPING(col)` - 1 if the row aggregated `col` away, 0 otherwise
- is the only honest way to tell them apart. Ex8 is this set's reason to
exist; the rest build up to it.

## ex1

The smallest possible rollup, drilled for shape recognition: `ROLLUP
(department)` is `GROUPING SETS ((department), ())`. What it tested:
knowing the grand total costs one clause, not a second query or a UNION.
The classic mistake is computing the total in application code and having
it disagree with the details after the next data change - the single-pass
version cannot disagree with itself. Ascending sort parks the NULL row
last, which is a default worth memorising: ASC means NULLS LAST.

## ex2

ROLLUP as hierarchy. Country contains year, so the three useful levels are
detail, per-country, overall - and `ROLLUP (country, yr)` produces exactly
those, while `CUBE` would add per-year-across-countries rows nobody asked
for. What it tested: matching the construct to the shape of the question,
and grouping by an expression (`extract(...)::int`) spelled identically in
SELECT and GROUP BY. The classic mistake is column order - `ROLLUP (yr,
country)` subtotals by year, a different report.

## ex3

`GROUPING()` for presentation. The label must come from the grouping
machinery, not from `coalesce(status, 'all statuses')` - a NULL test gives
the same answer *today*, but only because `status` happens to be NOT NULL,
and it trains exactly the habit that breaks in ex8. What it tested: putting
`GROUPING(status)` inside a CASE in the SELECT list. The model reasoning:
the question "is this a subtotal row" is metadata, and GROUPING is the only
place that metadata survives.

## ex4

The reporting classic: months under quarters under everything, one scan of
the period. What it tested: a two-level `ROLLUP` over two computed
expressions, plus lesson 18's half-open window discipline on the way in.
The classic mistake is grouping by month alone and computing quarters in
your head - or worse, in a spreadsheet stapled to the query's output. Note
how ordering by `qtr, month` interleaves each quarter's subtotal directly
after its months; that adjacency is why rollup output is pleasant to read
raw.

## ex5

The case the shorthands cannot express: two independent breakdowns and no
total. `ROLLUP` always ends in `()`; `CUBE` adds the cross too; only
`GROUPING SETS ((a), (b))` says precisely this. What it tested: knowing
that the empty set `()` is a choice, not a default. The classic mistake is
using CUBE and filtering the unwanted rows afterwards - it works (ex6 makes
you do it deliberately), but scanning to compute rows you then discard is
the tool telling you it was the wrong tool.

## ex6

The inverse of ex5: produce all four CUBE levels, keep two, and let
`GROUPING()` do the keeping *in HAVING* - proof that GROUPING is an
ordinary expression usable wherever groups are visible. The arithmetic
trick `GROUPING(a) + GROUPING(b) = 1` reads "exactly one dimension rolled
up", i.e. the margins. The classic mistake is filtering with `country IS
NULL OR status IS NULL`, which here happens to work but conflates data
NULLs with subtotal NULLs - the exact confusion this lesson exists to
unlearn. The reference asks for the margins directly with GROUPING SETS.

## ex7

A rollup where the second level is a JSONB extraction. Nothing about the
grouping machinery changes; what changes is the bookkeeping - the
expression must be spelled identically in SELECT and in ROLLUP, and two
measures (units, revenue) ride along untouched. What it tested: composing
lesson 19's accessors with lesson 50's grouping without flinching, and
predicting the row inventory (4 sizes x 2 categories + 2 + 1) before
running - the fastest correctness check a multi-level report has.

## ex8

The disambiguation problem in its pure form. `staff.manager_id` is really
NULL for the CEO, so the rollup's total row and the CEO's row *both* show
NULL - and only `GROUPING(manager_id)` can separate "aggregated away" from
"absent in the data". The CASE must test GROUPING first: the total row also
passes `IS NULL`, so branch order is load-bearing. The classic mistake is
`COALESCE(manager_id::text, 'NOBODY')` over the rollup, which cheerfully
labels the grand total NOBODY and hands the CEO 501 direct reports. The
reference sidesteps with UNION ALL - defensible, two scans, and a reminder
that the single-pass version is the one that needed the new concept.

## Further reading

- [GROUPING SETS, CUBE, and ROLLUP](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-GROUPING-SETS) - the expansion rules, and how duplicate grouping sets behave.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html#FUNCTIONS-GROUPING-TABLE) - GROUPING() and its bitmask form for multiple arguments.
- [SELECT - GROUP BY Clause](https://www.postgresql.org/docs/16/sql-select.html#SQL-GROUPBY) - the reference grammar, including grouping by expressions.
- [Sorting Rows](https://www.postgresql.org/docs/16/queries-order.html) - NULLS FIRST / NULLS LAST, and why ascending subtotals land after their details by default.
