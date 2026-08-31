# Reading - 79_drills_self_joins_1

One table, two aliases. Everything in this set follows from taking that
sentence literally.

## Notes

**A self-join is not a special kind of join.** `staff e JOIN staff m ON m.id
= e.manager_id` is the ordinary join you already know; the only new thing is
that both inputs happen to be the same table, so both need aliases and every
column reference needs a prefix. Postgres will refuse an unqualified `name`
here, and that error message is doing you a favour.

**The `ON` clause does not have to be an equality.** `t.salary > s.salary`,
`b.hired_on - a.hired_on >= 1825`, `a.id < b.id` are all legal join
conditions, and each of them produces a genuinely different shape: a ranking,
a gap analysis, a deduplicated pair list. Most of the leverage in self-joins
comes from remembering this.

**Pair queries are symmetric until you break them.** Joining a table to
itself on a shared attribute pairs every row with itself and every real pair
twice. `a.id < b.id` kills both problems in one condition - strictly less
than, not `<>`, because `<>` only removes the self-pairs and leaves the
mirror images. When the pair is already ordered by something else (a hire
date, a salary), the inequality that expresses that ordering does the same
job.

**NULL join keys never match, and that is usually what you want.**
`b.manager_id = a.manager_id` cannot pair the CEO with anybody, because the
CEO's `manager_id` is NULL and `NULL = NULL` is unknown. In a teammate query
that is exactly right. In an "everyone with their manager" query it is a bug,
and the fix is `LEFT JOIN`.

**A hierarchy is a self-join per level.** One join gets you the manager, two
get the manager's manager, three get the level above that. This dataset's
tree is four levels deep, so three chained self-joins reach the top from the
bottom. When the depth is unknown or unbounded, that approach runs out and
you need a recursive CTE - lesson 14, and drill set 89.

**An aggregate cannot produce a name.** "How many reports" is an aggregate of
the group; "the name of the best-paid report" is a property of one particular
row in it. The moment a report needs both, you need two constructs: a
`GROUP BY` for the number and a correlated subquery, `DISTINCT ON`, or a
window function for the row.

## ex1 - the plain employee-manager join

The shape everything else is built on. `staff` appears twice, once as the
employee and once as the manager, joined on `m.id = e.manager_id`.

The classic mistake is getting the direction backwards - `e.id =
m.manager_id` joins each manager to their reports instead, which is a valid
query answering a different question and produces plausible-looking rubbish.
Say the join out loud: "the manager row whose id equals this employee's
manager_id."

The model answer aliases both copies and prefixes every column; the reference
writes the same join starting from the manager side, to make the point that
join order is irrelevant to the result.

## ex2 - pairs, once each

Joining `staff` to itself on `manager_id` pairs everyone in a team with
everyone in that team, themselves included, in both directions. For a team of
four that is 16 rows where you wanted 6.

The classic mistake is `a.id <> b.id`, which removes the four self-pairs and
leaves 12 - every real pair still appears twice, mirrored. `a.id < b.id`
removes both classes at once and additionally guarantees the "lower id first"
the prompt asks for, which is why it is the idiom rather than one of several
options.

The model answer puts the inequality in the `ON` clause. The reference uses
the old comma-join spelling with everything in `WHERE`; the two are identical
to the planner, and seeing them side by side is a reminder that `ON` and
`WHERE` are interchangeable for inner joins - and only for inner joins.

## ex3 - the CEO problem

There is exactly one row in `staff` with a NULL `manager_id`, and an inner
self-join drops it silently. An answer one row short of the whole table is
the kind of error that survives review because nobody counts.

The classic mistake, after switching to `LEFT JOIN`, is special-casing the
gap column with a `CASE`. There is no need: `e.salary - NULL` is NULL, so the
arithmetic already produces the right answer. SQL's NULL propagation is
annoying in `WHERE` clauses and helpful in `SELECT` lists.

The model answer is a single `LEFT JOIN`. The reference uses two correlated
scalar subqueries instead, which return NULL when they find no row - the same
result by a different mechanism, and the shape to reach for when you want one
column from a lookup table without touching the join tree.

## ex4 - comparing two copies of the same column

Nothing structurally new; the value is in becoming comfortable with
`e.department <> m.department`, a comparison between two aliases of one
column. Read it as a sentence about two people and it stops looking strange.

The classic mistake is forgetting that `<>` is unknown when either side is
NULL. It does not bite here because the inner join has already excluded the
only NULL-manager row, but change that join to `LEFT` and the CEO's row
would quietly vanish again - this time in the `WHERE` clause rather than the
join. The reference uses `IS DISTINCT FROM`, which is the NULL-safe version
and treats NULL as an ordinary value.

The model answer joins employee to manager and compares the two department
columns directly. The rows it finds are the seams of the org chart, where a
department boundary is crossed.

## ex5 - an inequality join is a ranking

"How many colleagues earn more than me" is a count over a self-join whose
condition is `t.salary > s.salary`. Every person is joined to exactly the set
of people who out-earn them, and the size of that set is the answer.

The classic mistake is an inner join, which deletes the best-paid person in
the department - the one whose set is empty, and the one everybody actually
wants to see. The fix is `LEFT JOIN` plus `count(t.id)`, which is the same
`count(*)`-versus-`count(col)` distinction the outer-join drills were about,
turning up in a self-join.

The model answer does exactly that. The reference uses a correlated scalar
subquery, which cannot have the empty-set problem at all, because it returns
one row per person by construction. Worth knowing that this whole shape is
what `rank()` computes in one pass - lesson 15 - and that the self-join
version is what people wrote before window functions existed.

## ex6 - grouping a self-join

The grain is the manager; the rows being aggregated are their reports. So:
self-join, group by the manager's own columns, aggregate the report columns.

The classic mistake is putting the `>= 5` test in `WHERE`. It is a statement
about the size of the group, which does not exist until after grouping, so it
belongs in `HAVING`. The second mistake is grouping by `m.id` alone and then
selecting `m.name` - Postgres actually allows this, because `staff.id` is the
primary key and functionally determines the rest of the row, but it is not
portable and it hides the intent.

The model answer groups the join and filters with `HAVING`. Note what the
inner join does for free: managers with no reports produce no rows and are
absent from the answer without any extra condition, which here is exactly
right.

## ex7 - the inequality does the deduplication

Same teammate join as ex2, but the pair is ordered by hire date rather than
by id, so `a.id < b.id` would be wrong - it would throw away every pair where
the earlier hire happens to have the higher id.

The classic mistake is adding it anyway out of habit. Look at the result: the
last row of the reference answer pairs a higher-id person with a lower-id
one - an older-hire-with-higher-id pair that `a.id < b.id` would have
deleted. When a
condition already forces an order on the pair, it *is* the deduplication.

The other thing worth noticing is the arithmetic. Subtracting two `date`
values in PostgreSQL yields an integer number of days - not an interval, and
not a timestamp difference. That is why the prompt can ask for a plain
`days_apart` and why `1825` on the right-hand side of the comparison works
without a cast.

## ex8 - a count and a name in one row

The number of reports is an aggregate. The best-paid report's name is not -
it belongs to one specific row of the group, and no aggregate function can
extract it. Recognising that split is the whole exercise; once you have, both
halves are easy.

The classic mistake is `max(e.salary)` and `e.name` in the same `SELECT`,
which Postgres rejects, followed by `max(e.name)`, which it accepts and which
returns the alphabetically last name in the team. That second version is the
dangerous one: it runs, it looks right, and it is wrong on most rows.

The model answer counts with a `GROUP BY` and fetches the name with a
correlated subquery ordered by `salary DESC, id LIMIT 1`. The reference uses
`DISTINCT ON (manager_id)` with the same ordering - the compact PostgreSQL
idiom for "one row per key, the best one" (lesson 49) - joined back to the
counts. Either way the tie-break belongs in the ordering, not in your hopes:
without `, id` two reports on identical salaries would resolve differently
from run to run.

## Further reading

- [PostgreSQL - Table Aliases](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-TABLE-ALIASES) - the section that explicitly covers joining a table to itself, and why the aliases are mandatory rather than stylistic.
- [PostgreSQL - Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) - that the `ON` condition is any boolean expression, which is what licenses the inequality joins in ex5 and ex7.
- [PostgreSQL - Date/Time Functions and Operators](https://www.postgresql.org/docs/16/functions-datetime.html) - the operator table showing `date - date` returning an integer number of days. Behind ex7.
- [PostgreSQL - SELECT: DISTINCT ON](https://www.postgresql.org/docs/16/sql-select.html#SQL-DISTINCT) - one row per group chosen by an `ORDER BY`, the reference solution's answer to ex8.
- [PostgreSQL - WITH Queries (recursive)](https://www.postgresql.org/docs/16/queries-with.html) - where self-joins stop being enough: unbounded hierarchy depth, and the `WITH RECURSIVE` form that replaces them.
