# Reading - 90_drills_windows_1

Eight drills on numbering and ranking rows without collapsing them. Read after
your attempt, pass or fail.

## Notes

`row_number()`, `rank()` and `dense_rank()` answer three different questions
and only agree when the window's `ORDER BY` has no ties. `row_number()` always
produces 1, 2, 3, ... and is therefore **non-deterministic** whenever the
ordering does not uniquely identify a row - two rows tied on price get 4 and 5
in whichever order the executor happened to produce them, and that order can
change between runs. Adding a unique tie-break such as `id` is not decoration,
it is what makes the query reproducible, and every prompt in this set specifies
one for that reason. `rank()` gives tied rows the same number and then skips:
1, 1, 3. `dense_rank()` gives tied rows the same number and does not skip:
1, 1, 2, so it counts *distinct values* rather than rows. The practical rule
is: `row_number()` when you need exactly N rows, `rank()` when "joint second
place" is a real answer and you want a top-3 that may return four people, and
`dense_rank()` when you are numbering the values themselves. All three are
evaluated after `FROM`, `WHERE`, `GROUP BY` and `HAVING`, and before
`ORDER BY`, `DISTINCT` and `LIMIT` - which is exactly why they cannot appear
in `WHERE` and why filtering on one always costs an extra query level.

## ex1 - rank the categories

A window function whose argument is an aggregate looks wrong the first time
you see it and is entirely regular: `GROUP BY` has already run, the six
grouped rows are the window's input, and `count(*)` inside `rank()` refers to
each group's count. The classic mistake is reaching for a CTE because the
one-liner looks illegal - the reference shows the CTE version, which is
identical in plan and arguably clearer, but knowing the one-liner works saves
a level whenever the report is small.

## ex2 - three numberings of the same rows

Around a hundred reviews across five distinct ratings, so every tie behaviour
is visible at once. Read the output down the `rnk` column: it jumps from 1
straight to whatever the count of 5-star reviews plus one is, because `rank()`
skips. `drnk` moves 1, 2, 3, 4, 5 - one per distinct rating. `rn` counts rows
and needs `id` in its `ORDER BY` to be stable. The reference introduces the
`WINDOW` clause, which names a window definition once and reuses it, and is
worth adopting the moment the same `OVER (...)` appears twice in a query.

## ex3 - the first two customers of every country

The canonical "top N per group": number inside the partition, wrap in a
subquery, filter on the number. It cannot be done in one level because the
window has not been computed when `WHERE` runs. The classic mistake is
`ORDER BY created_at` alone - two customers who signed up in the same second
would then be numbered arbitrarily and the gate would fail intermittently,
which is the worst kind of failure. Note also that the numbering runs over all
50,000 customers and only then throws away the ones ranked third and below.

## ex4 - ranked inside your hiring year

Partitioning by an expression rather than a column is entirely ordinary -
`PARTITION BY extract(year FROM hired_on)` computes the key per row and
groups the window by it. The reference computes the year once in a CTE and
partitions by the resulting column, which is what you want as soon as the
expression appears in both `PARTITION BY` and the select list, because it
removes any doubt that the two are the same expression.

## ex5 - the third most expensive in each category

"The Nth per group" is the same machinery as top-N with `= 3` instead of
`<= 3`, and it is a useful sanity check on your mental model: if you can get
row 3 you understand that the numbering is per partition. Here `rank()` and
`row_number()` coincide because `(price DESC, id)` is unique, which the
reference relies on - but swap in `rank()` on `price` alone and the query
starts returning a different number of rows whenever two products share a
price.

## ex6 - which status won each month

Ranking inside a partition of an already-aggregated result is the standard
shape for "who won each period". Rank on `revenue`, not on `round(revenue, 2)`
- rounding is presentation, and two statuses a hundredth of a currency unit
apart would otherwise be declared tied. The reference computes the same rank
with a correlated `count(*) + 1` over the 52-row CTE, which is how this was
written before window functions existed and is still the clearest way to
explain what `rank()` means.

## ex7 - two rankings at once

Two windows in one `SELECT`, differing only in whether they partition, and the
gap between the two columns is the interesting output: a category's third
place might be the catalog's twenty-eighth. Nothing stops a query having as
many differently-defined windows as it likes; each is computed independently
over the same input rows. The classic mistake is filtering on `overall_rank`
by accident, which silently changes the question from "top 3 in each category"
to "of the catalog top 3, grouped by category".

## ex8 - the most and least reviewed, per category

Two `row_number()` windows over the same partition in opposite directions, then
an aggregation that picks the first of each using `FILTER`. The `LEFT JOIN`
matters: `count(r.id)` counts matching reviews and yields 0 for a product with
none, where `count(*)` would count the single left-joined row and report 1.
The reference's `DISTINCT ON (category)` is PostgreSQL's own idiom for "first
row per group" and is usually the fastest spelling, at the cost of being
non-portable and of needing one pass per direction.

## Further reading

- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - the tutorial introduction, including why a window function cannot appear in `WHERE`.
- [Window Function Processing](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-WINDOW) - where windows sit in the evaluation order, and the `WINDOW` clause.
- [Window Function Calls](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) - the full `OVER (...)` grammar.
- [`SELECT` - `DISTINCT ON`](https://www.postgresql.org/docs/16/sql-select.html#SQL-DISTINCT) - the alternative used in the exercise 8 reference.
