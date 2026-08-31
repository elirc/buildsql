# Reading - 112_drills_mixed_1

The first gauntlet: every problem welds topics from across the course. Read
after your attempt, pass or fail.

## Notes

Composed queries fail differently from simple ones: each ingredient works,
and the weld leaks. A status filter that lives in the wrong half of an
anti-join, a business rule applied to revenue but not to the favourite, a
window frame that includes the row it is supposed to judge - none of these
error out, all of them return confident numbers. The discipline this set
drills is stating each rule once in prose ("non-cancelled, everywhere
money or votes are counted") and then checking every clause of the
finished query against that sentence. Where two grains meet (ex6),
aggregate each side before joining; where a pick depends on an aggregate
(ex8), sequence the stages explicitly. Composition is mostly sequencing.

## ex1

JSONB meets the fact table: the grouping key is an extraction, the measure
is two joins away from it. What it tested: putting `->> 'color'` in GROUP
BY without staging it, and keeping the category filter on products where
it belongs. The classic mistake is grouping by the JSONB value `->
'color'` instead of the text `->> 'color'` - it works, but the output
carries quoted JSON strings and the gate notices the difference.

## ex2

A derived flag over a grouped expression. What it tested: `extract(isodow
...)` (Monday-first, so the weekend is 6 and 7) and the rule that SELECT
may build new expressions out of grouped ones - `dow >= 6` needs no
aggregate because `dow` is the group key. The classic mistake is
`extract(dow ...)`, whose Sunday-is-zero convention shifts the whole week
and flags Friday-Saturday as the weekend.

## ex3

An anti-join with a condition *inside* it. "No non-cancelled order" places
`status <> 'cancelled'` in the NOT EXISTS subquery; moving it outside
changes the question to "customers we cannot join a live order to after
filtering", which quietly drops the all-cancelled customers the request
most wants to see. What it tested: that placement decision, twice welded
to plain date and country filters. The reference is the LEFT JOIN ... IS
NULL spelling with the same condition riding the ON clause - same rule,
same placement question, different syntax.

## ex4

Rank-and-pick-the-middle: a position that depends on the group's size
needs two windows over the same partition - `row_number()` for where each
row sits and `count(*) OVER` for how long the ladder is - and then a
filter comparing them, which forces the CTE wrap because WHERE cannot see
window output. What it tested: that two-window composition, integer
division doing the middle-of-an-even-group tie-policy, and `row_number()`
(not `rank()`, whose gaps after salary ties would leave some departments
with no row at the computed position at all). The reference's lateral
`OFFSET (n+1)/2 - 1 LIMIT 1` is the same arithmetic walking instead of
numbering.

## ex5

A set difference wrapped in a count. What it tested: EXCEPT's built-in
deduplication doing exactly what "customers who..." needs, and half-open
month windows on both sides. The classic mistake appears in the anti-join
spelling: forgetting the DISTINCT on the October side and counting
*orders* whose customer skipped November, which inflates the answer by
every repeat buyer. EXCEPT never has that bug, which is a fine reason to
reach for it.

## ex6

The two-grain trap. Price is a per-product fact; rating is a per-review
fact; joining first and averaging after weights each product's price by
its review count - a number that looks right and means nothing. What it
tested: aggregating each measure at its own grain in its own CTE and
joining the two six-row summaries. This is the single most common silent
bug in analytics SQL; the fix - aggregate first, join after - is worth
saying aloud until it is reflex.

## ex7

A window frame with an exclusion. `ROWS BETWEEN 3 PRECEDING AND 1
PRECEDING` is the whole exercise: the benchmark must not include the month
it judges, and the frame edge is where that rule lives. What it tested:
frame arithmetic (empty frame for January gives NULL for free; partial
frames average what exists), plus comparing on unrounded values while
displaying rounded ones. The reference builds the same average by hand
from three lag() columns - reading it once makes the frame version feel
less like syntax and more like a sentence.

## ex8

The full three-stage weld: aggregate-sort-limit to find the whales, a
per-driving-row grouped pick for the favourite, and one business rule
(non-cancelled) that must hold in *both* stages. What it tested: lesson
48's lateral carrying a GROUP BY inside it, deterministic tie-breaks at
both levels, and rule consistency - a cancelled order's items must not
vote for the favourite of a customer whose revenue already excludes them.
Senior interviews love this shape precisely because the weld, not the SQL,
is where candidates leak.

## Further reading

- [Window Function Calls - Frames](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) - ROWS BETWEEN and frame-edge semantics.
- [Combining Queries (UNION, INTERSECT, EXCEPT)](https://www.postgresql.org/docs/16/queries-union.html) - set-operation deduplication rules.
- [Table Expressions - LATERAL Subqueries](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-LATERAL) - grouped subqueries per driving row.
- [JSON Functions and Operators](https://www.postgresql.org/docs/16/functions-json.html) - the extraction operators and their return types.
