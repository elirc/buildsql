# Reading - 66_drills_null_2

Eight drills on what NULL does once you start grouping, counting and joining.
Read after you have attempted them.

## Notes

Three rules unite this set. First, aggregates ignore NULL inputs: `count(col)`
counts non-NULL values while `count(*)` counts rows, and `avg` divides by the
number of non-NULL values rather than by the number of rows - so the same
column can produce two defensible averages. Second, grouping does the
opposite of comparison: `GROUP BY` gathers all the NULLs into one group
rather than discarding them, which means a NULL group can appear in a report
that never mentioned NULL. Third, outer joins manufacture NULLs on purpose,
and the aggregate you write on top of the join decides whether an unmatched
row reads as zero, as NULL, or as one - which is exactly the difference
between `count(*)`, `count(right.col)` and `coalesce(sum(...), 0)`.

## ex1 - count(*) is not count(column)

The cheapest NULL audit in SQL: put `count(*)` and `count(col)` side by side
and the gap between them is the number of missing values. Only the department
containing the CEO shows a gap here, which is what makes the result readable
at a glance. The classic mistake is the reverse - using `count(col)` when you
meant to count rows, and quietly under-reporting a group. Model answer: count
rows with `count(*)`, count values with `count(col)`, and never let the choice
be accidental.

## ex2 - a NULL group nobody asked for

Grouping keeps what filtering throws away. A NULL grouping key does not
disappear - it becomes a group of its own, labelled with nothing, and a
reader who does not know the query cannot tell whether that row means
"cancelled", "unknown" or "not applicable". The classic mistake is shipping a
report with a blank row in the category column and no legend. Model answer:
`nullif` makes the NULL deliberately, so you can see grouping treat NULLs as
one value even though comparison never would.

## ex3 - NULL-safe equality

`IS DISTINCT FROM` and its negation are the operators you want whenever a
comparison must treat two missing values as a match: deduplication, change
detection between an old and a new row, and merge logic all depend on it.
The classic mistake is writing `a = b OR (a IS NULL AND b IS NULL)` by hand,
which works but has to be repeated for every column and is easy to get wrong
under `NOT`. Model answer: one operator, one comparison, and the subquery
supplies the NULL that makes the point.

## ex4 - dividing by a count that might be zero

Every rate you will ever compute has a denominator that can be zero on some
slice of the data, usually the slice nobody tested. `nullif(x, 0)` converts
the crash into a missing value, which is the honest answer: the ratio is not
zero, it is undefined. The classic mistake is `coalesce(..., 0)` around the
whole ratio, which reports "zero staff per principal" for a department that
has no principals at all. Model answer: guard the divisor, keep the NULL, and
let the presentation layer decide how to draw it.

## ex5 - counting what did not match

The anti-join reads NULL as evidence: the right-hand columns are NULL for
exactly the rows that found no partner, so `WHERE oi.id IS NULL` after a
LEFT JOIN means "no match existed". The classic mistake is testing a nullable
column instead of the key - if the right table allowed NULLs in the column
you test, you would also catch rows that did match. Model answer: outer join,
test the key for NULL, then aggregate. `NOT EXISTS` expresses the same idea
without the join and is usually the clearer of the two.

## ex6 - sum of nothing, defaulted to zero

This is the pair of behaviours that outer-joined aggregates hinge on:
`count` of a right-hand column answers 0 for an unmatched group, but every
other aggregate answers NULL, because zero values were summed rather than
zero being one of them. Both `coalesce(sum(x), 0)` and `sum(coalesce(x, 0))`
happen to work here, which is worth noticing rather than memorising - the
first defaults the result, the second defaults the inputs, and they diverge
the moment a matched row can itself carry a NULL. The classic mistake is
`count(*)`, which counts the NULL-extended row and reports 1 report for
somebody who has none.

## ex7 - HAVING on the gap between two counts

A group-level test for missing data, written without touching `WHERE`. The
distinction matters because the two counts in the SELECT list have to be
computed over the whole department; pre-filtering the rows would leave you
with `headcount` equal to `rootless` in every surviving group. The classic
mistake is exactly that - moving the NULL test into `WHERE`, getting a
plausible-looking result, and not noticing that the first column is now
meaningless. Model answer: filter groups with `HAVING`, and let `FILTER`
carry the conditional counting inside the group.

## ex8 - average of nothing versus average of zeros

Two averages over the same join, differing only in where the `coalesce`
sits, and they answer different questions: "how good were the recent 5-star
reviews" versus "how good were the reviews, counting a silent product as
zero". Neither is wrong; publishing the wrong one is. The classic mistake is
the second form appearing by accident, usually because somebody wrapped
everything in `coalesce` to make the blanks in a spreadsheet go away, and the
resulting chart says a well-reviewed book scored 0. Note also that the
filters live in `ON` - in `WHERE` they would discard the very rows this drill
is about.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - read the sentence about NULL inputs at the top of the table, then the `FILTER` syntax notes.
- [`GROUP BY` and `HAVING`](https://www.postgresql.org/docs/16/queries-table-expressions.html) - grouping semantics, including how grouping treats values that are not distinct from each other.
- [Joins Between Tables](https://www.postgresql.org/docs/16/tutorial-join.html) - the tutorial's outer-join section, where the NULL-extended row is introduced with a worked example.
- [Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) - `IS DISTINCT FROM` and `IS NOT DISTINCT FROM`, the NULL-safe equality pair used in exercise 3.
