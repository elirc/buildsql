# Reading - 53_interview_concepts

The bank below is sixty-two questions with model answers. It is not a list
of facts to memorise; it is a list of *answers to rehearse out loud*, which
is a different activity and the only one that transfers to a room with
another person in it.

## Notes

**How to work this file.** Read the question, cover the answer, and say your
version aloud — actually aloud, not in your head, because the gap between
"I know this" and "I can say this in eight seconds" is the entire subject of
this lesson. Then read the model answer and mark what you missed. Three
passes over a week beats ten passes in one evening; that is what the spaced
review ladder is for, and it is why this lesson ships a review variant.

**What the stars mean.** ⭐⭐⭐ means expect it in most SQL screens for a
mid-level role — if you can only prepare ten answers, prepare these.
⭐⭐ means common, and near-certain if the job description mentions
analytics or reporting. ⭐ means it comes up when the interviewer is
probing depth, when the role is senior, or when you have just said
something that invited it.

**What a good answer sounds like.** Three to six sentences. Lead with the
one-line definition, give a concrete example, name the trade-off or the
trap, stop. Do not lecture; the interviewer is trying to have a
conversation, and the follow-up they have queued up is where the real
information is. Every answer here names that follow-up, because being
unsurprised by it is most of the effect.

**When the answer is "it depends", say what it depends on.** "Should you
index this column?" is not a yes/no question and the interviewer knows it.
"Depends on selectivity — an index on `orders.status` is close to useless
because half a million rows are only four values, but one on
`orders.customer_id` pays for itself immediately" is a complete answer in
one sentence, and it is worth more than a paragraph of theory.

**Everything below uses this course's schema**, so the examples are things
you can go and run: `customers` (50,000 rows, 5,003 of whom never ordered),
`orders` (500,000; 83,361 cancelled), `order_items` (1,000,000), `products`
(10,000; 300 never ordered), `reviews` (1,000,000), `events` (3,000,000) and
`staff` (500 people, a four-level org chart with exactly one NULL
`manager_id`). If an answer does not feel real, open `dojo lab` and make it
real.

## JOIN semantics and anti-joins

### Q1. What is the difference between an INNER JOIN and a LEFT JOIN? ⭐⭐⭐

An inner join returns only the row combinations where the `ON` condition is
true; a left join returns all of those *plus* every unmatched left row, with
the right-hand columns filled in as NULL. So `customers INNER JOIN orders`
returns 44,997 customers and silently drops the 5,003 who never ordered,
while the left join returns all 50,000. The NULLs a left join produces are
manufactured by the join, not present in the data — which is what makes them
easy to reason about once you say it that way.

*Follow-up:* "When would you use a RIGHT JOIN?" (Almost never — swap the
table order and use LEFT, so the preserved side is always the one you read
first.) *Weak here → redo `09_outer_joins`.*

### Q2. How do you find rows in one table that have no match in another? ⭐⭐⭐

That is an anti-join, and there are two idioms. `NOT EXISTS` states it
directly: `SELECT p.id FROM products p WHERE NOT EXISTS (SELECT 1 FROM
order_items oi WHERE oi.product_id = p.id)` returns our 300 never-ordered
products. The older idiom is `LEFT JOIN ... WHERE right.key IS NULL`, which
works because a genuine match can never have a NULL key. PostgreSQL
recognises both and executes them as a real anti-join node, so the choice is
about readability — I reach for `NOT EXISTS` because it says the word "not".

*Follow-up:* "What about `NOT IN`?" — see Q11, and be ready, because that is
the whole reason they asked. *Weak here → redo `09_outer_joins`.*

### Q3. A LEFT JOIN of yours "isn't working" — the unmatched rows vanished. Why? ⭐⭐⭐

Because a condition on the right-hand table ended up in `WHERE` instead of
`ON`. The logical order is: match rows using `ON`, NULL-extend the unmatched
left rows, *then* apply `WHERE`. `LEFT JOIN reviews r ON r.product_id = p.id
WHERE r.rating = 5` evaluates `NULL = 5` for every unreviewed product, which
is unknown, not true — so `WHERE` deletes them and the left join has become
an inner join with extra steps. Move the condition into the `ON` clause and
the unmatched products come back, NULL-extended.

*Follow-up:* "Is there a case where the right-table condition belongs in
WHERE?" (Yes — `WHERE r.id IS NULL`, which is deliberately the anti-join.)
*Weak here → redo `09_outer_joins`.*

### Q4. What does a FULL OUTER JOIN do, and when have you used one? ⭐⭐

It keeps unmatched rows from both sides, NULL-extending whichever side is
missing. The honest answer is that it is a reconciliation tool: when you
have the same entity in two systems and you need to list what each has that
the other does not, a full join with `WHERE a.id IS NULL OR b.id IS NULL`
gives you both discrepancy lists in one pass. In day-to-day reporting it is
rare, and an interviewer asking is usually checking whether you will invent
a use for it.

*Follow-up:* "How would you write that with set operations instead?"
(`EXCEPT` in both directions, unioned.) *Weak here → redo `11_set_operations`.*

### Q5. What is a CROSS JOIN, and how do you get one by accident? ⭐⭐

A cross join is the Cartesian product: every left row paired with every
right row, so `orders` crossed with `products` would be five billion rows.
You get one by accident by forgetting a join condition — in the old
comma-separated syntax, `FROM orders o, products p` with no `WHERE` linking
them is a legal query that will sit there for a very long time. Deliberately,
it is genuinely useful for generating grids: cross a `generate_series` of
months against the six product categories so your report has a row for every
combination, including the empty ones.

*Follow-up:* "How would you spot one in an EXPLAIN plan?" (A `Nested Loop`
with no join filter, and an estimated row count that is the product of both
inputs.) *Weak here → redo `08_inner_joins`.*

### Q6. Why does my join return more rows than the table I started with? ⭐⭐⭐

Because the join key is not unique on the other side, so each left row is
duplicated once per match. Joining `orders` to `order_items` gives a million
rows, not half a million, and if you then `sum(o.total)` you have counted
every order once per line item and inflated revenue by roughly a factor of
two. The fix is not `DISTINCT`; it is to aggregate the many-side first in a
subquery or CTE, then join one row to one row.

*Follow-up:* "So when *is* `DISTINCT` the right answer?" (When you genuinely
want distinct values of what you selected — not as damage control after a
fan-out.) *Weak here → redo `08_inner_joins` and `51_query_rewrites`.*

### Q7. What is a semi-join? ⭐⭐

A semi-join answers "does at least one match exist?" and returns each left
row **once**, regardless of how many matches there are. In SQL you write it
as `EXISTS` or `IN`; there is no `SEMI JOIN` keyword. It matters because
"customers who have at least one cancelled order" is a semi-join, and doing
it with an ordinary join returns one row per cancelled order — for a
customer with three cancellations, three rows.

*Follow-up:* "And an anti-join?" (The negation: `NOT EXISTS`, "no match
exists".) *Weak here → redo `13_subqueries`.*

### Q8. Does the order of tables in a join matter? ⭐

For inner joins, not to the result and not usually to performance — the
planner is free to reorder them and will pick the order it costs cheapest.
For outer joins it matters to the result (`A LEFT JOIN B` is not `B LEFT
JOIN A`) and it also constrains the planner, which is why a long chain of
left joins sometimes plans worse than the equivalent inner joins. If a query
only needs an inner join, saying so gives the optimiser room it would
otherwise not have.

*Follow-up:* "What is `join_collapse_limit`?" (The number of tables above
which PostgreSQL stops exhaustively reordering — a fine thing to know exists
and rarely a thing to change.) *Weak here → redo `37_join_algorithms`.*

## NULLs and three-valued logic

### Q9. What does NULL mean in SQL? ⭐⭐⭐

NULL means *unknown*, not zero and not empty string. That is why comparisons
against it produce a third truth value: `NULL = NULL` is not true, it is
unknown, and `WHERE` keeps only rows where the condition is true. So you
test with `IS NULL` / `IS NOT NULL`, or with `IS DISTINCT FROM` when you
want two NULLs to count as equal. Our `staff.manager_id` is NULL for exactly
one person — the CEO — which is a real "unknown/not applicable", not a
missing value someone forgot to fill in.

*Follow-up:* "What does `count(*)` do with NULLs versus `count(col)`?"
(Q17.) *Weak here → redo `05_null_logic`.*

### Q10. Walk me through three-valued logic. ⭐⭐

Every predicate evaluates to true, false or unknown, and `WHERE`, `ON` and
`HAVING` keep only true. `true AND unknown` is unknown; `false AND unknown`
is false; `true OR unknown` is true. The practical consequence is that
`NOT (unknown)` is still unknown, so negating a condition does not partition
your rows into two halves — `WHERE total > 100` and `WHERE NOT (total >
100)` together miss every row where `total` is NULL.

*Follow-up:* "Where else does that bite?" (`CHECK` constraints, which pass on
unknown — a `CHECK (price > 0)` does not stop a NULL price; only `NOT NULL`
does.) *Weak here → redo `05_null_logic`.*

### Q11. Why does this NOT IN query return zero rows? ⭐⭐⭐

Because the subquery returned a NULL. `WHERE s.id NOT IN (SELECT manager_id
FROM staff)` expands to `id <> m1 AND id <> m2 AND ... AND id <> NULL`, and
that last term is unknown, so the whole chain is unknown for every row and
`WHERE` keeps nothing. Our `staff` table has exactly one NULL `manager_id`
and that is enough to return zero rows out of 500. Fix it by filtering the
NULL out of the subquery, or — better — by using `NOT EXISTS`, which is
immune because it asks about row existence rather than value equality.

*Follow-up:* "Why doesn't plain `IN` have the same problem?" (It does have
the same semantics, but a NULL in the list can only fail to produce a match
— it cannot turn a true into an unknown, so you get a *missing* row rather
than an *empty* result. Quieter, still wrong.) *Weak here → redo
`05_null_logic` and `51_query_rewrites`.*

### Q12. How do aggregates treat NULLs? ⭐⭐

They skip them. `sum`, `avg`, `min`, `max` and `count(col)` all ignore NULL
inputs, so `avg(salary)` is the average over the non-NULL salaries, not a
division by the full row count. The two things that catch people out are
that `sum` over zero non-NULL rows returns NULL rather than 0 — wrap it,
`coalesce(sum(x), 0)` — and that `count(*)` counts rows regardless, which is
why it disagrees with `count(col)`.

*Follow-up:* "What does `avg` return for an empty group?" (NULL, and there
is no sensible zero for an average, so leave it NULL.) *Weak here → redo
`06_aggregates`.*

### Q13. How do NULLs sort? ⭐

In PostgreSQL, NULLs sort last in `ASC` and first in `DESC` — they are
treated as larger than everything. You override that with `NULLS FIRST` or
`NULLS LAST` on the `ORDER BY` clause. This is worth knowing precisely
because it is not portable: other engines default the other way, so a query
ported from elsewhere can silently reorder its top-10 list.

*Follow-up:* "Where does that matter in a window function?" (Inside `OVER
(ORDER BY ...)` — the frame and therefore `lag`/`lead`/`row_number` follow
the same rule.) *Weak here → redo `03_order_limit`.*

### Q14. What is COALESCE, and what is the difference from NULLIF? ⭐⭐

`coalesce(a, b, c)` returns the first non-NULL argument, so it is how you
supply a default: `coalesce(sum(oi.quantity), 0)` turns "no rows matched"
into a zero on a report. `nullif(a, b)` is the inverse move — it returns
NULL when `a = b`, and its classic use is guarding division:
`total / nullif(count, 0)` yields NULL instead of raising a divide-by-zero.

*Follow-up:* "Is `coalesce` the same as `CASE WHEN x IS NOT NULL THEN x`?"
(Yes semantically; `coalesce` short-circuits and reads better.) *Weak here →
redo `04_expressions_functions`.*

### Q15. When should a column be nullable? ⭐⭐

When "unknown" or "not applicable" is a genuine state of the entity —
`staff.manager_id` is NULL for the CEO because a CEO genuinely has no
manager, and inventing a self-reference to avoid the NULL would be worse.
Default to `NOT NULL` everywhere else: every nullable column is a branch
every future query has to handle, and most nullable columns in real schemas
are there because nobody decided, not because someone did. If a nullable
column starts carrying meaning — NULL meaning "pending" — that is a status
column asking to be born.

*Follow-up:* "How would you add a `NOT NULL` column to a live table with
half a million rows?" (Add it nullable, backfill in batches, then `SET NOT
NULL` — Q56 and lesson 28.) *Weak here → redo `25_constraints`.*

## Grouping: GROUP BY and HAVING

### Q16. What is the difference between WHERE and HAVING? ⭐⭐⭐

`WHERE` filters rows before grouping; `HAVING` filters groups after
aggregation. So "orders over 1900" is `WHERE o.total > 1900` and "customers
with more than five orders" is `HAVING count(*) > 5`, because the count does
not exist until the group does. When both would work — a filter on the
grouping column itself — prefer `WHERE`, because it removes rows before the
aggregation has to do the work.

*Follow-up:* "Can `HAVING` reference a column that isn't in the `GROUP BY`?"
(Only inside an aggregate.) *Weak here → redo `07_group_by_having`.*

### Q17. What is the difference between count(\*), count(col) and count(DISTINCT col)? ⭐⭐⭐

`count(*)` counts rows. `count(col)` counts rows where `col` is not NULL.
`count(DISTINCT col)` counts distinct non-NULL values. The difference is
invisible until you cross an outer join, and then it is a bug: `products
LEFT JOIN reviews` grouped per product gives `count(*) = 1` for a product
with no reviews at all, because the NULL-extended row is still a row, while
`count(r.id)` correctly gives 0.

*Follow-up:* "Which is faster?" (`count(*)` — it never has to inspect a
value; `count(DISTINCT)` is much more expensive because it must deduplicate.)
*Weak here → redo `06_aggregates` and `09_outer_joins`.*

### Q18. Why does "column must appear in the GROUP BY clause" happen? ⭐⭐⭐

Because every column in the select list of a grouped query has to be either
one of the grouping columns or wrapped in an aggregate — otherwise the
database would have to pick one value out of many rows arbitrarily. Adding
`p.name` to `GROUP BY p.category` is not the fix if you wanted one row per
category; the fix is to decide what `name` means for a whole category, which
is usually `min(p.name)` or, more honestly, that you wanted to group by
product all along. PostgreSQL will let you select `p.name` while grouping by
`p.id` alone, because `id` is the primary key and functionally determines
the rest of the row.

*Follow-up:* "Does MySQL behave the same way?" (Historically no — it would
pick a value silently, which is why the error feels unfamiliar to people
arriving from there.) *Weak here → redo `07_group_by_having`.*

### Q19. What does FILTER do, and why not just use CASE? ⭐⭐

`count(*) FILTER (WHERE status = 'cancelled')` restricts one aggregate to a
subset of the group without a subquery, so a single pass over `orders` can
produce paid, pending, shipped and cancelled counts side by side.
`count(CASE WHEN status = 'cancelled' THEN 1 END)` does the same thing and
is the portable spelling; `FILTER` is standard SQL, supported by PostgreSQL,
and reads far better. Both are how you pivot a long table into a wide report
without leaving the query.

*Follow-up:* "How would you get percentages per status in the same row?"
(Same trick, divided by an unfiltered `count(*)`, with a `100.0` to avoid
integer division.) *Weak here → redo `17_conditional_pivots`.*

### Q20. How do you find duplicates in a table? ⭐⭐⭐

`GROUP BY` the columns that should be unique and `HAVING count(*) > 1`. To
see the offending rows rather than just the keys, either join that result
back to the table, or use `row_number() OVER (PARTITION BY email ORDER BY
id)` and keep everything with `rn > 1` — which has the advantage of also
being the delete list if you are cleaning up.

*Follow-up:* "How would you delete all but the oldest of each duplicate
set?" (Exactly that `rn > 1` set, deleted by primary key.) *Weak here →
redo `07_group_by_having` and `15_window_functions_1`.*

### Q21. What are GROUPING SETS, ROLLUP and CUBE? ⭐

They let one query produce several levels of aggregation at once. `ROLLUP
(category, status)` gives you per-category-per-status rows, per-category
subtotals and a grand total in a single pass, with NULLs marking the
subtotal rows (`GROUPING()` tells you which NULLs are subtotals rather than
data). It is the difference between one scan of `orders` and three unioned
scans, so it is worth reaching for on a report that has "and a total row" in
its spec.

*Follow-up:* "How do you tell a subtotal NULL from a data NULL?" (The
`GROUPING()` function.) *Weak here → redo `50_grouping_sets`.*

## Window functions

### Q22. What is a window function, and how does it differ from GROUP BY? ⭐⭐⭐

A window function computes across a set of rows related to the current row
but does **not** collapse them — you keep every input row and gain a column.
`GROUP BY` collapses. So `avg(price) OVER (PARTITION BY category)` puts each
product next to its category average, which a `GROUP BY` cannot do because
it has already thrown the individual products away. If a question contains
"each row, alongside…" it is a window function; if it contains "one row per…"
it is a `GROUP BY`.

*Follow-up:* "Can you do both in one query?" (Yes — window functions run
after aggregation, so `row_number() OVER (ORDER BY sum(total) DESC)` on top
of a `GROUP BY` is legal and common.) *Weak here → redo
`15_window_functions_1`.*

### Q23. ROW_NUMBER, RANK, DENSE_RANK — what's the difference? ⭐⭐⭐

They differ only on ties. `ROW_NUMBER` always produces 1, 2, 3, 4, picking
arbitrarily between tied rows. `RANK` gives tied rows the same number and
then skips: 1, 2, 2, 4. `DENSE_RANK` gives tied rows the same number and
does not skip: 1, 2, 2, 3. So "the top 3 per category" with `ROW_NUMBER`
returns exactly three rows even under a tie, while `RANK` may return four —
and which one is correct depends on whether the business wants three rows or
everyone who tied for third.

*Follow-up:* "How do you make `ROW_NUMBER` deterministic?" (Add a unique
tie-break column to the `ORDER BY`, usually the primary key.) *Weak here →
redo `15_window_functions_1`.*

### Q24. How do you get the top N rows per group? ⭐⭐⭐

Two layers. Inner: `row_number() OVER (PARTITION BY category ORDER BY price
DESC, id)`. Outer: `WHERE rn <= 3`. It has to be two layers because you
cannot reference a window function in the `WHERE` of the same `SELECT` —
`WHERE` runs before the window is computed. In PostgreSQL there are two
other good answers: `DISTINCT ON` when N is 1, and a `LATERAL` subquery with
`LIMIT N`, which can be much faster when the group count is small and an
index supports the ordering.

*Follow-up:* "Which of those would you pick for a hundred groups and ten
million rows?" (`LATERAL` with an index on `(group, measure DESC)` — it
fetches N rows per group instead of sorting everything.) *Weak here → redo
`15_window_functions_1`, `48_lateral_joins` and `49_distinct_on`.*

### Q25. How do you compute a running total or a month-over-month change? ⭐⭐⭐

Aggregate to the grain first, then window over it. Monthly revenue comes
from `date_trunc('month', created_at)` with `sum(total)`; the running total
is `sum(revenue) OVER (ORDER BY month)`, and the month-over-month delta is
`revenue - lag(revenue) OVER (ORDER BY month)`. `lag` returns NULL for the
first row, and that NULL is the right answer — turning it into a zero claims
a fact you do not have.

*Follow-up:* "What does `OVER (ORDER BY month)` default its frame to?"
(`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — Q26.) *Weak here →
redo `16_window_functions_2`.*

### Q26. What is a window frame? ⭐⭐

The frame is the slice of the partition a window function actually sees for
the current row. With no `ORDER BY` the frame is the whole partition; add an
`ORDER BY` and it defaults to everything from the start up to the current
row, which is what silently makes `sum()` a running total. You override it
explicitly with `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` — that is a
seven-day moving average — and the `ROWS` versus `RANGE` distinction matters
when the ordering column has duplicates, because `RANGE` includes all peers
of the current row and `ROWS` counts physical rows.

*Follow-up:* "So what happens to a 7-day moving average if a day is
missing?" (`ROWS` averages seven *rows*, not seven days — you need a
generated calendar first.) *Weak here → redo `16_window_functions_2`.*

### Q27. Where do window functions run in the order of evaluation? ⭐

After `FROM`, `WHERE`, `GROUP BY` and `HAVING`, and before `DISTINCT`,
`ORDER BY` and `LIMIT`. That single fact explains every window-function
error message you will ever see: you cannot filter on one in `WHERE`
(it does not exist yet), you can order by one, and you need a subquery or
CTE to filter on one. It also explains why `row_number() OVER (ORDER BY
sum(total) DESC)` is legal — the aggregation has already happened.

*Follow-up:* "Then how do you filter on a window result?" (Wrap it: CTE or
subquery, then `WHERE` outside.) *Weak here → redo `15_window_functions_1`.*

## Subqueries, EXISTS and IN

### Q28. What is a correlated subquery? ⭐⭐⭐

One that references a column from the outer query, so it cannot be evaluated
once — conceptually it runs per outer row. `SELECT c.id, (SELECT count(*)
FROM orders o WHERE o.customer_id = c.id) FROM customers c` is correlated;
the same subquery without the `WHERE` referencing `c` is not. In practice
PostgreSQL often rewrites correlated subqueries into joins or semi-joins, so
"correlated means slow" is a half-truth worth stating carefully.

*Follow-up:* "When does the planner *not* manage to decorrelate it?"
(Scalar subqueries in the select list with aggregates, and anything with
`LIMIT` inside — those genuinely run per row.) *Weak here → redo
`13_subqueries`.*

### Q29. EXISTS or IN — which do you use? ⭐⭐⭐

For a positive test, either; PostgreSQL plans both as a semi-join, so the
choice is style. For a *negative* test the answer is `NOT EXISTS`, always,
because `NOT IN` breaks the moment the subquery can produce a NULL. The
other tiebreaker is what the subquery returns: `IN` needs a single column,
while `EXISTS` can correlate on several conditions at once, so a multi-column
match reads better as `EXISTS`.

*Follow-up:* "Is `EXISTS` faster because it short-circuits?" (Not
meaningfully in PostgreSQL — the semi-join stops at the first match either
way. Say that rather than repeating the folklore.) *Weak here → redo
`13_subqueries`.*

### Q30. When would you use a subquery instead of a join? ⭐⭐

When you want a *test* rather than *columns*. If you need data from the
other table in your output, join. If you only need to know whether a related
row exists, or you need a single scalar like "the overall average price to
compare each product against", a subquery says that more clearly and cannot
fan out your row count. The readability argument matters more than the
performance one, because the planner frequently converts between the two
forms anyway.

*Follow-up:* "And a CTE instead of a subquery?" (Same thing with a name;
name it when it is used twice or when the query has stopped fitting in your
head.) *Weak here → redo `13_subqueries` and `14_ctes`.*

### Q31. Are CTEs optimisation fences in PostgreSQL? ⭐⭐

They were, before version 12 — a `WITH` clause was always materialised,
which meant predicates could not be pushed into it and a CTE could be
dramatically slower than the equivalent subquery. Since 12 a CTE referenced
exactly once and free of side effects is inlined like a subquery, and you
can force the old behaviour with `WITH x AS MATERIALIZED (...)` or forbid it
with `NOT MATERIALIZED`. Knowing the version boundary is the answer; knowing
that `MATERIALIZED` is occasionally the fix for a plan that keeps
recomputing an expensive CTE is the follow-up.

*Follow-up:* "When would you *want* the fence?" (An expensive CTE referenced
several times, or one whose row estimate the planner keeps getting wrong.)
*Weak here → redo `14_ctes`.*

### Q32. What is a recursive CTE for? ⭐

Walking hierarchies and graphs — anything where you do not know the depth in
advance. Our `staff` table is a four-level org chart, and the query that
prints each person's depth or their whole management chain up to the CEO is
a `WITH RECURSIVE`: an anchor row (the CEO, where `manager_id IS NULL`) and
a recursive term that joins `staff` to the rows found so far. The other
common use is generating series when `generate_series` will not do.

*Follow-up:* "How do you stop it looping forever on a cycle?" (Track the
visited path in an array and exclude it, or bound the depth.) *Weak here →
redo `14_ctes`.*

### Q33. What is a LATERAL join? ⭐

A subquery in the `FROM` clause that is allowed to reference columns from
tables to its left — effectively a `for each row, run this` loop that the
planner can still optimise. It is the clean answer to "top 3 per group" when
the groups are few and the rows are many: cross join the six categories
against a `LATERAL` subquery that fetches the top three products for that
category with `ORDER BY ... LIMIT 3`. Without `LATERAL`, a subquery in
`FROM` cannot see the outer row at all.

*Follow-up:* "How does that plan differ from the window-function version?"
(N index lookups per group instead of sorting the whole table.) *Weak here →
redo `48_lateral_joins`.*

## Indexes and how PostgreSQL uses them

### Q34. What is an index, and what does a B-tree actually give you? ⭐⭐⭐

A B-tree is a sorted, balanced structure that turns "find the rows where
`email = x`" from a scan of all 50,000 rows into a handful of page reads.
Because it is *sorted*, it serves more than equality: range predicates
(`created_at >= '2023-10-01'`), `ORDER BY` on the indexed columns (no sort
node needed), and `MIN`/`MAX` (walk to one end). What it does not serve is
anything that does not preserve that ordering — a leading wildcard
`LIKE '%kettle'`, or a function applied to the column.

*Follow-up:* "Why does an index not help `WHERE status = 'paid'` here?"
(Q37 — selectivity.) *Weak here → redo `31_first_index`.*

### Q35. What is the left-prefix rule? ⭐⭐⭐

A composite index on `(a, b, c)` is sorted by `a`, then `b` within equal
`a`, then `c`. So it serves predicates on `a`, on `(a, b)` and on
`(a, b, c)` — any leading prefix — but not a predicate on `b` alone, because
the `b` values are scattered across the whole index. That is why column
order in a composite index is a design decision, not a formatting one: put
equality columns first and the range column last, since everything after a
range predicate stops being usable for filtering.

*Follow-up:* "Would `(a, b)` help `WHERE a = 1 ORDER BY b`?" (Yes — and it
eliminates the sort as well as the filter, which is the real win.) *Weak
here → redo `32_composite_indexes` and `33_left_prefix`.*

### Q36. Are foreign keys indexed automatically? ⭐⭐

The referenced side is, because it must be unique — but the referencing
column is not. `orders.customer_id` in this database has no index, which is
why "all orders for one customer" scans half a million rows, and why
deleting a customer has to scan `orders` to check the constraint. This is
the single most common missing index in real schemas, and naming it is a
strong signal in an interview.

*Follow-up:* "So should every FK be indexed?" (Nearly always yes if you ever
join or cascade on it; the exception is a tiny child table.) *Weak here →
redo `33_left_prefix`.*

### Q37. When is an index not worth it? ⭐⭐⭐

When the predicate is not selective enough. `orders.status` has four values
over 500,000 rows, so `WHERE status = 'paid'` matches half the table and a
sequential scan genuinely is cheaper than 250,000 random heap fetches — the
planner will ignore your index and it will be right. Indexes also cost on
every write and take space, so the rule is: index what you filter, join and
order by, in that order, and measure rather than guess.

*Follow-up:* "Is there a way to index a low-selectivity column usefully?"
(A partial index — `WHERE status = 'pending'` — which is small because only
the pending rows are in it.) *Weak here → redo `39_partial_indexes`.*

### Q38. What is a covering index / index-only scan? ⭐⭐

If every column a query needs is present in the index, PostgreSQL can answer
from the index alone and never touch the table — an index-only scan. You get
extra columns in without making them part of the sort key using `INCLUDE`.
The PostgreSQL-specific catch is the visibility map: because indexes do not
store row visibility, an index-only scan still has to check the heap for
pages that are not marked all-visible, so a freshly-updated table degrades
to ordinary heap fetches until `VACUUM` runs.

*Follow-up:* "Why did my index-only scan get slower after a bulk update?"
(Exactly that — the visibility map went stale.) *Weak here → redo
`34_index_only_scans`.*

### Q39. My query has an index but the plan shows a Seq Scan. Why? ⭐⭐⭐

Four usual reasons, and it is worth listing them in this order. The
predicate is not selective enough, so the scan is genuinely cheaper. The
predicate does not match the index — `lower(email) = ...` cannot use an
index on `email`, only one on `lower(email)`, and the same goes for a
leading `%` in `LIKE`. The statistics are stale, so the planner thinks the
predicate matches far more rows than it does; `ANALYZE` fixes that. Or the
types do not match and there is an implicit cast on the column side.

*Follow-up:* "How would you confirm which of those it is?" (`EXPLAIN` for
the estimate versus `EXPLAIN ANALYZE` for the actual, and `pg_stats` for the
distribution.) *Weak here → redo `36_statistics_and_the_planner` and
`51_query_rewrites`.*

### Q40. What index types exist besides B-tree? ⭐

GIN for containment queries — full-text search over `tsvector`, and JSONB
`@>` against something like `products.attributes`, where a B-tree can only
match the whole document. BRIN for very large tables whose physical order
correlates with the column, like `events.ts` here, which is strictly
increasing with `id`: a BRIN index stores min/max per block range, so it is
thousands of times smaller than a B-tree at the cost of being approximate.
GiST for ranges and geometry.

*Follow-up:* "What is the failure mode of BRIN?" (Correlation loss — after
enough updates and reordering, the block ranges overlap and the index stops
excluding anything.) *Weak here → redo `41_gin_fulltext`, `42_gin_jsonb`
and `43_gist_brin`.*

### Q41. How would you index for a query you cannot change? ⭐⭐

Read its predicates in order: equality columns first, then one range column,
then anything needed only for output goes in `INCLUDE`. If it has an `ORDER
BY ... LIMIT`, index in that order so the sort disappears and the limit stops
early. Then verify with `EXPLAIN (ANALYZE, BUFFERS)` that the plan actually
changed — half the indexes in a typical database are unused, and
`pg_stat_user_indexes` will tell you which.

*Follow-up:* "How do you find unused indexes?" (`pg_stat_user_indexes.idx_scan
= 0`, checked over a period long enough to include the monthly reports.)
*Weak here → redo `35_order_by_and_indexes`.*

## Reading plans, N+1 and slow queries

### Q42. How do you approach a slow query? ⭐⭐⭐

`EXPLAIN (ANALYZE, BUFFERS)` first, always — never guess. Then read the plan
from the innermost node outward looking for three things: a node where the
estimated row count is wildly different from the actual (a statistics or
correlation problem), the node consuming most of the time, and any scan
reading far more rows than the query ultimately returns. Only then decide
whether the fix is an index, a rewrite, or a change to what is being asked
for.

*Follow-up:* "What if the plan looks fine but it is still slow?" (Look at
`BUFFERS` for I/O, at lock waits, and at whether the client is fetching a
million rows over the network.) *Weak here → redo `30_reading_explain`.*

### Q43. What is the difference between EXPLAIN and EXPLAIN ANALYZE? ⭐⭐⭐

`EXPLAIN` shows the plan and the planner's *estimates* without running the
query. `EXPLAIN ANALYZE` actually executes it and adds the real row counts
and timings, so you can compare estimated against actual. The two warnings
worth stating: `EXPLAIN ANALYZE` really does run the statement, so wrap a
`DELETE` in a transaction you roll back, and per-node timing adds measurable
overhead on plans that push a lot of rows — `TIMING OFF` when you are
measuring total runtime.

*Follow-up:* "What does `rows=... loops=...` mean on an inner node?" (The
row count is *per loop*; multiply by `loops` for the total — the most
commonly misread number in the whole plan.) *Weak here → redo
`30_reading_explain`.*

### Q44. What is the N+1 query problem? ⭐⭐⭐

You fetch a list with one query, then issue one more query per item to fetch
its details — one query to list 100 orders, then 100 queries for each
order's customer. It is usually an ORM default: a lazy-loaded relationship
inside a loop. The database is not the problem; the round trips are, and 101
round trips at even one millisecond each is a slow page that profiles as
"the database is slow". The fix is a join or an eager-load, or a single
`WHERE id = ANY($1)` batch.

*Follow-up:* "How do you detect it?" (Query logs showing the same statement
shape repeated with different parameters, or an APM trace with a comb of
identical spans.) *Weak here → redo `37_join_algorithms`.*

### Q45. What is a nested loop join, and when is it the right plan? ⭐⭐

For each row of the outer input, probe the inner input — cheap when the
outer side is small and the inner side has an index on the join key, which
makes it the natural plan for "one customer's orders". It degrades badly
when the outer side is large and the inner probe is a scan, which is the
plan shape behind most "why is this query taking four minutes" tickets. Hash
join is the answer for two large unsorted inputs; merge join for two large
inputs already sorted on the key.

*Follow-up:* "What makes the planner switch from hash to nested loop?"
(A better row estimate on the outer side, or a new index making the inner
probe cheap.) *Weak here → redo `37_join_algorithms`.*

### Q46. What does ANALYZE do, and why would a plan suddenly get worse? ⭐⭐

`ANALYZE` samples a table and stores column statistics — row counts, most
common values, histograms — in `pg_statistic`, and the planner costs every
alternative plan using those numbers. If the statistics are stale after a
bulk load or a large delete, the estimates are wrong and the plan chosen is
wrong with them; a plan that "suddenly got worse" after a data change is
this, most of the time. Autovacuum normally runs `ANALYZE` for you, which is
also why disabling autovacuum to "reduce load" reliably backfires.

*Follow-up:* "What if one column's distribution is skewed?" (Raise its
statistics target, or add extended statistics for correlated columns.)
*Weak here → redo `36_statistics_and_the_planner`.*

### Q47. Why is OFFSET 100000 slow, and what do you do instead? ⭐⭐

Because `OFFSET` still produces and discards every skipped row — page 5,000
of a list costs five thousand pages of work to return twenty rows, and it
gets worse as the user pages deeper. Keyset (or "seek") pagination fixes it:
remember the last row's sort key and ask for `WHERE (created_at, id) <
($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20`, which an index on
those columns answers in constant time whatever the page number. The
trade-off is that you lose the ability to jump to an arbitrary page number,
which most product surfaces do not actually need.

*Follow-up:* "What breaks with OFFSET when rows are inserted mid-paging?"
(Rows shift between pages — items get skipped or repeated. Keyset is immune.)
*Weak here → redo `52_keyset_pagination` and `03_order_limit`.*

## Transactions, ACID and isolation

### Q48. What does ACID stand for? ⭐⭐⭐

Atomicity — a transaction is all or nothing. Consistency — it moves the
database from one valid state to another, constraints included. Isolation —
concurrent transactions do not see each other's incomplete work. Durability
— once committed, it survives a crash. The one worth expanding on
unprompted is atomicity, with the classic example: debiting one balance and
crediting another must both happen or neither, or money evaporates.

*Follow-up:* "Which one do isolation levels trade away?" (Isolation — you
choose how much of it you pay for.) *Weak here → redo `23_transactions`.*

### Q49. What isolation levels are there, and what do they prevent? ⭐⭐

Read Uncommitted, Read Committed, Repeatable Read, Serializable, in
increasing strictness. Read Committed — PostgreSQL's default — means each
statement sees a snapshot taken when *that statement* started, so you never
read uncommitted data but two identical queries in the same transaction can
disagree. Repeatable Read fixes the snapshot for the whole transaction.
Serializable additionally guarantees the outcome matches some serial order,
at the cost of transactions that may abort with a serialization failure your
application has to retry.

*Follow-up:* "What is a phantom read, and which level stops it?" (New rows
appearing in a repeated range query; Serializable in the standard, and
PostgreSQL's Repeatable Read also prevents it thanks to snapshot isolation.)
*Weak here → redo `23_transactions`.*

### Q50. What is MVCC? ⭐⭐

Multi-Version Concurrency Control: an `UPDATE` does not overwrite a row, it
writes a new version and marks the old one dead, and each transaction sees
the versions valid for its snapshot. That is why readers never block writers
and writers never block readers in PostgreSQL. The cost is dead tuples,
which is what `VACUUM` exists to reclaim — and why a table that is updated
constantly without adequate vacuuming bloats and slows down even though its
live row count never changes.

*Follow-up:* "What is transaction ID wraparound?" (The reason vacuum is not
optional — a fine thing to know exists.) *Weak here → redo
`44_mvcc_vacuum_bloat`.*

### Q51. What is a deadlock, and how do you avoid one? ⭐⭐

Two transactions each hold a lock the other needs, so neither can proceed;
PostgreSQL detects the cycle and kills one with a deadlock error. The
standard prevention is to acquire locks in a consistent order everywhere in
the application — if every code path updates accounts in ascending id order,
the cycle cannot form. Keeping transactions short and not doing network
calls inside them is the other half of the answer.

*Follow-up:* "What is `SELECT ... FOR UPDATE` for?" (Taking the row lock
early and deliberately, so the read-modify-write is safe.) *Weak here →
redo `23_transactions`.*

### Q52. What is an optimistic versus pessimistic locking strategy? ⭐

Pessimistic takes the lock up front — `SELECT ... FOR UPDATE` — and makes
everyone else wait; correct, and it serialises your hot rows. Optimistic
reads a version number, does the work, and updates `WHERE version = $1`,
retrying if zero rows were affected because somebody else got there first.
Optimistic wins when conflicts are rare and the work between read and write
is slow, such as a user staring at an edit form.

*Follow-up:* "Where does the version column live?" (On the row; a
`updated_at` timestamp works, an integer counter is safer.) *Weak here →
redo `23_transactions`.*

## Schema design: normalization, keys and constraints

### Q53. Explain normalization up to third normal form. ⭐⭐

1NF: every column holds a single atomic value — no comma-separated lists of
tags in a text column. 2NF: no non-key column depends on only part of a
composite key — if `order_items` were keyed on `(order_id, product_id)`,
storing the product's name there would violate it, because the name depends
on the product alone. 3NF: no non-key column depends on another non-key
column — storing a customer's country on `orders` as well as `customers` is
the classic breach, and the classic symptom is one of the two copies going
stale.

*Follow-up:* "When would you denormalise on purpose?" (Read-heavy reporting
where the join cost dominates and the duplicated value is immutable, like the
unit price snapshotted onto `order_items` here — which is not a breach at
all, because the price *at order time* is genuinely a different fact from the
current price.) *Weak here → redo `26_normalization`.*

### Q54. What is the difference between a primary key, a unique constraint and a foreign key? ⭐⭐⭐

A primary key uniquely identifies a row and cannot be NULL; there is one per
table, and PostgreSQL builds a unique index for it automatically. A unique
constraint enforces uniqueness on other columns — `customers.email` should
have one — and does allow NULLs, with multiple NULLs permitted because they
are all "unknown" and unknown does not equal unknown. A foreign key says a
value must exist in another table's key, and it is what makes an orphaned
`order_items.order_id` impossible.

*Follow-up:* "Natural key or surrogate?" (Surrogate integer or UUID by
default — natural keys have a habit of changing, and then they change in
five referencing tables at once.) *Weak here → redo `25_constraints`.*

### Q55. What do the ON DELETE options do? ⭐⭐

`NO ACTION`/`RESTRICT` refuse the delete while children exist — the safe
default for anything financial. `CASCADE` deletes the children too, which is
right for genuinely owned data like an order's line items and catastrophic
when someone applies it to a shared lookup table. `SET NULL` orphans the
children deliberately, which needs the column to be nullable and needs you to
have decided that a parentless child is meaningful.

*Follow-up:* "Why can a delete be slow with a foreign key?" (The child's
referencing column is not indexed, so every delete scans the child table —
Q36 again.) *Weak here → redo `25_constraints`.*

### Q56. How do you add a NOT NULL column to a big live table safely? ⭐

In steps, because a single `ALTER TABLE ... SET NOT NULL` needs an
`ACCESS EXCLUSIVE` lock while it verifies every row. Add the column
nullable, backfill in batches so no one transaction rewrites half a million
rows, then add a `CHECK (col IS NOT NULL) NOT VALID` — which takes a brief
lock — and `VALIDATE CONSTRAINT` afterwards without blocking writers. Modern
PostgreSQL can then convert that validated check into `SET NOT NULL`
cheaply. Adding a column *with a default* is fast since PostgreSQL 11, which
is a version boundary worth knowing.

*Follow-up:* "Why does `CREATE INDEX` on a live table need the same care?"
(`CONCURRENTLY` — slower, no write lock, and it can leave an invalid index
if it fails.) *Weak here → redo `28_altering_live_schemas`.*

### Q57. What is a view for, and what is a materialized view? ⭐⭐

A view is a stored query — it names a piece of logic so the join lives in
one place instead of eleven dashboards, and it costs exactly what the
underlying query costs every time it is read. A materialized view stores the
*result*, so reads are cheap and the data is stale until you
`REFRESH MATERIALIZED VIEW`. The trade-off is the whole answer: use a view
for correctness and reuse, a materialized view when an expensive aggregate
is read far more often than the underlying data changes.

*Follow-up:* "How do you refresh without blocking readers?"
(`REFRESH ... CONCURRENTLY`, which needs a unique index on the view.) *Weak
here → redo `27_views` and `46_materialized_views`.*

## Set operations, deleting and paginating

### Q58. UNION or UNION ALL? ⭐⭐⭐

`UNION` removes duplicate rows, which means it must sort or hash the entire
result to find them. `UNION ALL` just concatenates. If you know the two
inputs are disjoint — this month's orders and last month's — `UNION ALL` is
correct and materially faster, and reaching for plain `UNION` out of habit
is a real cost on large result sets. Both require the same column count and
compatible types across the branches.

*Follow-up:* "What do `INTERSECT` and `EXCEPT` do?" (Rows in both; rows in
the first and not the second — both deduplicate by default, both have `ALL`
variants.) *Weak here → redo `11_set_operations`.*

### Q59. DELETE, TRUNCATE or DROP? ⭐⭐

`DELETE` removes rows, is transactional, fires triggers, can have a `WHERE`,
and leaves dead tuples for `VACUUM` to reclaim. `TRUNCATE` empties a whole
table almost instantly by discarding its files — it is still transactional
in PostgreSQL, but it takes an `ACCESS EXCLUSIVE` lock, does not fire
row-level triggers, and cannot be filtered. `DROP` removes the table itself.
For "delete all 500,000 rows", `TRUNCATE` is seconds and `DELETE` is minutes
plus bloat.

*Follow-up:* "Does `TRUNCATE` reset sequences?" (Only with `RESTART
IDENTITY`; and it needs `CASCADE` if other tables reference it.) *Weak here
→ redo `21_insert_update_delete`.*

### Q60. How do you delete a large number of rows without hurting production? ⭐

In batches, each in its own transaction — `DELETE FROM events WHERE id IN
(SELECT id FROM events WHERE ts < $1 LIMIT 10000)` in a loop — so no single
statement holds locks or generates WAL for hours. Between batches, let
autovacuum catch up, because the dead tuples are the real cost. If you are
deleting most of the table, the better plan is often to copy the survivors
into a new table and swap, or to have partitioned by date in the first place
so the delete becomes a `DROP TABLE` on one partition.

*Follow-up:* "How would partitioning have helped?" (Dropping a partition is
metadata; deleting its rows is I/O.) *Weak here → redo `45_partitioning`.*

### Q61. How would you paginate a large result set? ⭐⭐

`LIMIT`/`OFFSET` for small, shallow lists — it is simple and everyone
understands it. Keyset pagination once the list is large or the user can
page deep, because `OFFSET` gets linearly slower and shifts rows under the
user when data changes underneath. Whichever you use, the `ORDER BY` must be
*total* — add the primary key as a tie-break — or the same row can appear on
two consecutive pages purely because the sort was ambiguous.

*Follow-up:* "How do you show a total page count with keyset pagination?"
(You usually do not; you show "next", or an approximate count from the
planner's estimate.) *Weak here → redo `52_keyset_pagination`.*

### Q62. What is an UPSERT, and how do you write one? ⭐⭐

Insert the row if it is not there, update it if it is, atomically. In
PostgreSQL that is `INSERT ... ON CONFLICT (email) DO UPDATE SET name =
EXCLUDED.name`, where `EXCLUDED` refers to the row that would have been
inserted. The prerequisite people forget is that the conflict target needs a
unique constraint or index — without one there is nothing for `ON CONFLICT`
to detect. `DO NOTHING` is the variant for idempotent inserts, and the whole
construct is how you make a data-loading job safe to re-run.

*Follow-up:* "Why not `SELECT` then `INSERT` in the application?" (A race:
two workers both see nothing and both insert. `ON CONFLICT` is atomic.)
*Weak here → redo `22_upsert`.*

## ex1 — the trap, cold

Q11 is the single most valuable answer in this file, and this exercise is
that answer with your hands on the keyboard. Say the expansion out loud
before you fix anything: `id <> 3 AND id <> 12 AND ... AND id <> NULL` is
unknown for every row, and `WHERE` keeps only true. Zero rows out of 500 —
not an error, not a warning, just a report that has quietly said "nobody" for
six months.

Know both fixes and know which one you would defend. Filtering the NULL out
of the subquery is a patch: it works, and it depends on a future reader
noticing why the `IS NOT NULL` is there. `NOT EXISTS` removes the trap
instead of stepping around it, and it is what an interviewer is listening
for. There is a third answer worth having in your pocket — `LEFT JOIN staff
m ON m.manager_id = s.id WHERE m.id IS NULL` — because it proves you know
the anti-join is one idea with three spellings.

## ex2 — "customers who bought X but never Y"

This question is asked because it cannot be answered by a single join, and
watching a candidate discover that is informative. The positive fact and the
negative fact live in different rows, so no `WHERE` clause over one joined
row can express both: `p.category = 'electronics' AND p.category <> 'books'`
is true of every electronics line ever sold, and produces a completely wrong
answer that looks completely reasonable.

Notice also that the answer stays correct if you use `IN` and `NOT IN` here,
because `orders.customer_id` is `NOT NULL` — a good thing to say out loud in
an interview, since it shows you checked rather than followed a rule. The
1,623 customers this returns are three percent of the base: a real
merchandising segment, and precisely the kind of list that gets computed
wrongly and mailed to the wrong people.

## ex3 — top N per group, on the clock

Top-N-per-group is one of a handful of queries interviewers ask by name, and
the two-layer shape is the thing to have automatic: rank inside the group,
filter outside. If you found yourself trying to write `WHERE row_number() <=
2`, that is the error message telling you about evaluation order — window
functions are computed after `WHERE`, so the filter has to live one level
out.

The tie-break is not decoration. Review counts here cluster in the 120s and
130s, so ties for second place are likely, and `row_number()` without a
tie-break picks arbitrarily — the same query returning different rows on
different runs is the worst kind of bug to debug. Adding `, id` to the
`ORDER BY` makes the answer a fact rather than a coincidence. And be ready
for the follow-up: with `rank()` instead, a tie for second returns three
rows for that category, which may be exactly what the business wants.

## ex4 — one row per customer, no DISTINCT

The gate here is a row count, which is the same thing the interviewer is
watching. A join from `customers` to `orders` filtered on `status =
'cancelled'` returns one row per cancelled order, so a customer with three
cancellations appears three times, and the instinctive repair — bolt
`DISTINCT` on the front — passes the gate while telling the interviewer that
you generated wrong rows and then hid them.

`EXISTS` is the shape that cannot fan out, because nothing from `orders`
reaches the select list. Say that sentence in the room; it is the difference
between "I know the trick" and "I know why". The 2,247 Japanese customers
this returns are about 86% of the 2,620 who have ordered at all — one in six
orders is cancelled in this dataset, so almost everybody has eventually had
one.

## review1 — the same shape, later

One positive fact, one negative fact, same customer. By the time this comes
back around on the review ladder you should be able to see the shape from
the sentence alone, before you think about syntax — that recognition is what
the exercise is actually measuring, not whether you can type `NOT EXISTS`.

Write it the second way too, with `HAVING count(*) FILTER (WHERE o.status =
'cancelled') = 0` over a join, and notice that the join itself supplies the
"has ordered at least once" half of the question. Being able to produce a
second correct answer and explain why you prefer the first is the whole
performance an interview is scoring.

## Further reading

- [PostgreSQL — Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the formal semantics of every join type, including exactly when NULL-extension happens relative to `WHERE`. Q1–Q8 in one page.
- [PostgreSQL — Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) — `EXISTS`, `IN`, `ANY`/`ALL`, and the paragraph that explains the `NOT IN` NULL behaviour in the driest possible language.
- [PostgreSQL — Window Function Processing](https://www.postgresql.org/docs/16/queries-window.html) — frames, `PARTITION BY`, and where windows sit in the evaluation order. The answer to Q26 and Q27.
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/16/transaction-iso.html) — what each level actually guarantees in PostgreSQL, which is not always what the standard requires. Read before answering Q49 in anger.
- [Use The Index, Luke](https://use-the-index-luke.com/) — the best free explanation of B-trees, the left-prefix rule and index-supported ordering. Q34–Q41 are this book compressed.
- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/16/using-explain.html) — worked plan examples with the estimate-versus-actual reading habit built in.
