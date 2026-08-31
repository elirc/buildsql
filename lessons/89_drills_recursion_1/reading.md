# Reading - 89_drills_recursion_1

Eight drills on `WITH RECURSIVE`: walking a hierarchy in both directions and
generating a series. Read after your attempt, pass or fail.

## Notes

A recursive CTE is two queries joined by `UNION ALL`: an **anchor** that
produces the starting rows, and a **recursive term** that may reference the
CTE's own name and produces the next rows from the last batch. PostgreSQL runs
the anchor once, then runs the step repeatedly against only the rows the
previous iteration added, stopping when an iteration adds nothing. Three
consequences follow and they explain every bug in this set. First, the step
sees the *previous* iteration's output, not the whole accumulated result, so
"have I already visited this node" is not a question you can ask without
carrying a marker yourself. Second, the anchor fixes the column types for the
whole CTE - start `path` as `name::text` or `ARRAY[name]`, because a bare
literal will be typed `unknown` and the step's concatenation will not match.
Third, direction is a choice made by the join condition and nothing else:
`ON s.manager_id = tree.id` descends, `ON s.id = tree.manager_id` ascends, and
`UNION` instead of `UNION ALL` would deduplicate rows and give you cycle
protection for free at the cost of a comparison per row. This dataset's org
chart is a clean tree with no cycles, so `UNION ALL` is safe here; against
data you do not control, carrying an array of visited ids and testing
`NOT id = ANY(visited)` is the standard defence.

## ex1 - how wide is each level

The smallest useful org-chart walk, and the one that tells you whether your
anchor is right: the level-1 count must be exactly 1, because there is exactly
one row with a `NULL` `manager_id`. The classic mistake is anchoring on
`manager_id = 1` rather than `IS NULL`, which quietly assumes the CEO's id.
The reference walks the other way for the same answer - from every employee
upwards, counting hops until the row with no manager appears - which is a
useful trick when you only care about a few starting nodes.

## ex2 - the chain above the lowest-paid person

Ascending is the same machinery with the join reversed: the step looks for the
staff row whose `id` equals the current row's `manager_id`. Because the anchor
selects exactly one person, the whole recursion is four rows deep and finishes
instantly. The classic mistake is selecting the target with a hard-coded id
copied out of a previous run - at `DOJO_SCALE=0.1` there are 50 staff rather
than 500 and that id belongs to somebody else, or to nobody. The `pos`
counter is just an accumulator incremented by the step, exactly like `depth`.

## ex3 - a calendar with no table behind it

Recursion is not only for hierarchies: any series with a rule for "the next
one" can be generated this way, which is how you get a row for a month that
contains no orders at all. Aggregates are legal in the anchor and illegal in
the recursive term, which is why the stopping bound lives in a subquery in the
`WHERE` - PostgreSQL evaluates it once as an InitPlan. In practice you would
write `generate_series`, as the reference does; the recursive form is what you
fall back on when the step is not a fixed increment - compounding interest,
schedule expansion, or "the next working day".

## ex4 - everybody's full chain of command

Carrying a value down the recursion turns a walk into a fold: `path` starts as
one name and each step appends to it. Note the `::text` cast on the anchor.
Without it PostgreSQL types the anchor column from the literal and can refuse
the recursive term with "recursive query column has type text in
non-recursive term but type ... overall" - and even where it works, the
explicit cast documents the intent. The reference accumulates an array and
converts once at the end, which is faster for deep trees and lets you index
into the ancestors afterwards.

## ex5 - depth and leaves per department

Two different questions answered over the same walk: the maximum depth comes
from the recursion, and "manages nobody" is an ordinary anti-join that needs
no recursion at all. Mixing them in one query is the point - recursion is a
tool for the part of the problem that is genuinely recursive, not a style to
apply to the whole statement. The classic mistake is assuming every department
bottoms out at the same depth; departments are inherited from the manager in
this dataset, so a department's depth range depends on where its head sits.

## ex6 - how many people are under you, at any depth

Anchoring on **every** row rather than on the root, and carrying that starting
id as `root`, builds the transitive closure of the hierarchy: one row per
(ancestor, descendant) pair, plus each node paired with itself. Counting by
`root` and subtracting the self-pair gives the subtree size. This is the
single most useful recursive pattern to have in your fingers, because
everything else - subtree sums, "is X under Y", depth differences - is a
grouping over the same closure. The classic mistake is `count(*)` without the
`- 1`, which counts the manager as their own descendant.

## ex7 - who is your division head

The same carry-the-root idea, but anchored on one specific level - the CEO's
direct reports - and carrying identity downwards so every person inherits the
head of their division. Because the anchor rows are their own heads, the
division heads come out with a ratio of exactly 1.000, which is a useful
self-check on the query. The reference carries the head's name and salary
through the recursion instead of carrying the id and joining back at the end;
both work, and the join-at-the-end version keeps the recursive rows narrow,
which matters when the tree is large.

## ex8 - the expensive subtrees

The closure from exercise 6 with a `sum` instead of a `count`, plus a
whole-company total to divide by. The interesting property is that these
percentages deliberately do not add up to 100: subtrees nest, so the CEO's
100% contains every division head's share, which contains their managers'
shares. That is correct and it is exactly why the report is useful - it says
how much payroll each person is ultimately responsible for. The classic
mistake is filtering on the rounded percentage instead of the raw payroll,
which flips a subtree sitting at exactly 4.995% into the result.

## Further reading

- [`WITH` Queries - Recursive Queries](https://www.postgresql.org/docs/16/queries-with.html#QUERIES-WITH-RECURSIVE) - the anchor/step model, `UNION` versus `UNION ALL`, cycle detection and `SEARCH`/`CYCLE`.
- [`generate_series`](https://www.postgresql.org/docs/16/functions-srf.html) - the non-recursive way to build the calendar in exercise 3.
- [Array Functions and Operators](https://www.postgresql.org/docs/16/functions-array.html) - `array_to_string`, `||` and `= ANY(...)`, used for paths and cycle guards.
- [Date/Time Functions](https://www.postgresql.org/docs/16/functions-datetime.html) - `date_trunc` and interval arithmetic on `timestamptz`.
