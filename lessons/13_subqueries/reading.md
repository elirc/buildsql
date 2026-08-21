# Reading - 13_subqueries

A subquery is a query used as a value, a list, a table, or a test. Choosing
which of the four you are writing is most of the skill — and the choice is
about *stating intent*, because PostgreSQL's planner will rewrite most of
them into the same handful of physical operations anyway.

## Notes

**The four shapes.**

- **Scalar** — returns one row, one column. Usable anywhere a value is:
  `WHERE price > (SELECT avg(price) FROM products)`, or in the SELECT list.
  If it returns more than one row at runtime, the query *errors* — which
  makes it fragile if the data can change shape.
- **List** — returns one column, feeding `IN` / `NOT IN` / `ANY` / `ALL`.
- **Table (derived table)** — returns rows and columns, sits in `FROM`, and
  must be aliased. This is a CTE without the name.
- **Test** — `EXISTS` / `NOT EXISTS`, returning a boolean and nothing else.

**Correlated versus uncorrelated.** An uncorrelated subquery does not
mention the outer query and can be evaluated once. A correlated one refers
to a column of the outer row, so *conceptually* it re-runs per row. The word
"conceptually" is load-bearing: PostgreSQL usually rewrites correlated
`EXISTS` and `IN` into semi-joins and hash joins, so the quadratic mental
model is not the physical reality. Trust the `EXPLAIN`, not the intuition —
Part 5 will show you the rewrite happening.

**`EXISTS` is the anti-join to reach for.** You now know three:

| idiom | NULL-safe? | can return right-side columns? |
|---|---|---|
| `LEFT JOIN ... WHERE r.key IS NULL` | yes | yes |
| `EXCEPT` | yes (NULLs compare equal) | no |
| `NOT EXISTS` | yes | no |
| `NOT IN (subquery)` | **no** | no |

`NOT IN` is the only broken one, and lesson 05 explains why. `NOT EXISTS`
is the default because it says what it means, it short-circuits, and no
future nullable column can break it.

**`EXISTS` never fans out.** This is its other quiet virtue. A join to a
one-to-many table duplicates the outer row per match, which is why so much
real-world SQL has a `DISTINCT` bolted onto it. `EXISTS` asks a yes/no
question and returns the outer row once. When you see `SELECT DISTINCT`
sitting on top of a join whose right-hand columns are never selected, the
query wanted `EXISTS`.

**`IN` versus `EXISTS` versus `= ANY`.** `x IN (subquery)` and `x = ANY
(subquery)` are the same thing. `EXISTS` is more general because the
correlation condition can be anything — an inequality, several columns, a
range overlap — not just equality on one column.

**Scalar subqueries in the SELECT list are convenient and dangerous.** Three
of them means three correlated lookups per row; on a large outer set that is
a real cost, and the equivalent `LEFT JOIN ... GROUP BY` or a window function
(lesson 15) is usually faster. Their advantage is that they cannot change
the outer row count, which makes them safe when you are nervous about grain.

**Where a subquery may not go.** You cannot use a bare aggregate in `WHERE`,
and you cannot reference a SELECT-list alias there either — both because of
the evaluation order from lesson 07. The derived table exists precisely to
give you a place to stand: compute in an inner query, filter in the outer
one.

## ex1 — above-average products (scalar)

`(SELECT avg(price) FROM products)` is uncorrelated, so it is computed once
and compared against every row. Notice the shape of the answer: fewer than
half the products are above average, because the price distribution is not
symmetric. "Above average" is a phrase stakeholders use loosely and it very
rarely means "the median".

## ex2 — orders containing a luxury item (list)

The `IN` form avoids a fan-out that a join would create: an order with three
products over 490 appears once here and three times with a naive join. The
prompt calls this out and it is worth internalising — most `SELECT DISTINCT`
in the wild is compensating for a join that should have been an `IN` or an
`EXISTS`.

## ex3 — NOT EXISTS anti-join

Same rows as lesson 09's `LEFT JOIN ... IS NULL`, sturdier idiom. Run both
through `dojo plan` when you reach Part 5: PostgreSQL executes both as an
anti-join, so the choice really is about the reader, not the machine.

Sturdier in a specific sense worth naming. The `LEFT JOIN` version breaks if
somebody later tests the wrong column for NULL — a nullable data column
instead of the key — and the `NOT IN` version breaks if the inner column
ever becomes nullable. `NOT EXISTS` has no column to get wrong and no NULL
to be poisoned by. Idioms that cannot be subtly mis-edited are worth
preferring even when all three work today.

## ex4 — EXISTS, the positive form

Short-circuiting and no fan-out, in one query. The `SELECT 1` convention is
worth explaining once: `EXISTS` discards the subquery's output entirely, so
`SELECT 1`, `SELECT *`, and `SELECT 1/0` are all equivalent — the last one
genuinely does not raise, because the expression is never evaluated. Writing
`SELECT 1` signals to a human reader that presence is all you want.

## ex5 — a subquery in the SELECT list

Twenty correlated counts. The form's guarantee — the outer row count cannot
change — is the reason people reach for it, and its cost is the reason
people regret it at scale. When you find yourself writing three of these in
one SELECT list, that is a `LEFT JOIN ... GROUP BY` trying to be born, or a
window function (lesson 15) that would compute all three in one pass.

## ex6 — a subquery in FROM (the derived table)

The shape that unlocks "filter on an aggregate you just computed". Note that
`HAVING sum(total) > 20000` answers this exercise too, in fewer lines — the
derived table earns its keep when the outer query needs to do more than
filter (join the result to something, window over it, aggregate it again).
Lesson 14 gives this exact construct a name and turns nesting into a
readable pipeline.

## challenge — latest order per customer (correlated)

The correlated `max()` pattern, and it is worth knowing that this is the
*old* way. It re-derives the maximum per customer, and it breaks subtly when
two orders share a timestamp (you get both). Lesson 15 does it with
`row_number()` and one pass; lesson 49 does it with `DISTINCT ON` in three
lines. Writing it the hard way first is what makes those land.

## review1 — above your department's average

A correlated scalar in `WHERE`: the inner `avg` depends on the outer row's
department. This is the canonical "compare a row to its group" question, and
it is exactly what `avg(salary) OVER (PARTITION BY department)` does in one
pass in lesson 15. Two lessons from now you will be able to see why the
window version is both clearer and cheaper.

## Further reading

- [Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) — `EXISTS`, `IN`, `NOT IN`, `ANY`/`SOME`, `ALL`, and the row-constructor forms. The NULL notes here are the whole of lesson 05 restated.
- [Table Expressions — subqueries in FROM](https://www.postgresql.org/docs/16/queries-table-expressions.html) — derived tables, why they need an alias, and how `LATERAL` lifts the restriction on referring to earlier FROM items (lesson 48).
- [Scalar Subqueries](https://www.postgresql.org/docs/16/sql-expressions.html) — the one-row-one-column rule and where such a subquery may appear.
- [`WITH` Queries](https://www.postgresql.org/docs/16/queries-with.html) — the same power with names attached, plus the inlining rules that matter for performance. Lesson 14.
