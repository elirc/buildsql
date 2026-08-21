# Reading - 11_set_operations

Joins combine tables sideways; set operations stack result sets vertically.
The distinction sounds cosmetic and is not: set operations compare *whole
rows* by value, which gives them NULL semantics, deduplication behaviour and
performance characteristics that no join has.

## Notes

**The four operators.** `UNION` (in either), `UNION ALL` (in either,
duplicates kept), `INTERSECT` (in both), `EXCEPT` (in the first and not the
second). Everything except `UNION ALL` deduplicates its result, and
deduplication is not free — it costs a sort or a hash over the entire
combined output.

**`UNION ALL` should be your default.** Write `UNION` only when you actually
need the dedup. The reasoning is symmetrical: `UNION` on provably disjoint
sets pays for a sort that removes nothing, and `UNION` on sets that *do*
overlap silently deletes rows a report may have been commissioned to show.
"Which dedup behaviour does this query need, and which did it get?" is a
question worth asking of every `UNION` you review.

**Column compatibility is positional, not by name.** Both sides must produce
the same number of columns with compatible types, matched left to right. The
output column names come from the **first** query and the others are
ignored — which means a `UNION` between two queries whose columns are in
different orders is not an error, it is a data-corruption bug that type
compatibility happily allows (`id, total` versus `total, id` on two numeric
columns will run). Always read a set operation column by column.

**Set operations treat NULLs as equal.** This is one of the very few places
in SQL where `NULL = NULL` behaves as true: two rows containing NULL in the
same position are duplicates for `UNION`, and `EXCEPT` will remove a
NULL-containing row using another NULL-containing row. This is why `EXCEPT`
is immune to lesson 05's `NOT IN` trap while looking superficially similar,
and it is a genuinely useful property for reconciliation queries.

**Precedence.** `INTERSECT` binds tighter than `UNION` and `EXCEPT`, and
`UNION`/`EXCEPT` are left-associative — so `A UNION B EXCEPT C` means
`(A UNION B) EXCEPT C`. As with `AND`/`OR` in lesson 02, the right response
is not to memorise the table but to parenthesise anything mixed.

**`ORDER BY` and `LIMIT` apply to the whole thing.** They are written once,
after the last query, and they sort the combined result. To sort or limit
one branch, wrap that branch in parentheses — `(SELECT ... ORDER BY x LIMIT
5) UNION ALL (SELECT ...)`.

**When to prefer a set operation over a join.** When both sides are lists of
the same kind of thing and you want "or", "and also", or "but not" between
the *lists*. The set operator cannot fan out — a join between customers and
orders duplicates a customer once per matching order, and every "why does
this customer appear four times?" bug is that fan-out. The set operator also
has no join key to get wrong. Conversely, when you need columns from both
sides in the same row, only a join will do.

**Performance note.** `EXCEPT` and `INTERSECT` both materialise and sort or
hash both inputs. `NOT EXISTS` / `EXISTS` (lesson 13) can often stop early
and are usually the faster idiom when one side is huge and you only need a
membership test. The set operators win on clarity when both sides are
already small, filtered lists.

## ex1 — either list

A `UNION` between two genuinely overlapping sets: a Brazilian customer with
a 1,995-real order is in both halves and appears once. That is the dedup
earning its cost.

Note what the two branches have in common and what they do not. Both produce
a single integer column that means "a customer id" — that shared *meaning*
is what makes the union sensible. Nothing in SQL checks it: the same query
would happily union customer ids with product ids, because both are `int`.
Type compatibility is the only guard rail, and it is a low one.

## ex2 — in one list, not the other

The anti-join from lesson 09 in two lines. Worth holding all three idioms
side by side, because you will meet all three in other people's code:
`LEFT JOIN ... WHERE key IS NULL`, `NOT EXISTS (...)`, and `EXCEPT`. They
answer the same question; they differ in NULL safety (`NOT IN` is the only
broken one), in whether they can return columns from the right side (only
the join can), and in how they plan.

## ex3 — in both lists

`INTERSECT` where a join would fan out. This is the cleanest demonstration
in the lesson of why set operators exist: the join version needs a `DISTINCT`
bolted on to be correct, and a `DISTINCT` bolted onto a join is usually a
sign that the query is answering a set question with the wrong tool.

## ex4 — UNION ALL, and the duplicates it keeps

Two different sources of duplication in one query — within a branch, and
across branches — and `UNION` erases both indiscriminately. The lesson is
that `UNION`'s dedup is not a "cleanup"; it is a semantic decision about
what a row *means*. If a row means "one order over 1,995", deduplicating
destroys information. If it means "one customer to email", deduplicating is
the point.

## challenge — symmetric difference

There is no `SYMMETRIC EXCEPT`, so you compose it: `(A EXCEPT B) UNION (B
EXCEPT A)`. Parenthesise both halves — this is exactly the precedence
situation from the notes, and without the parentheses the left-associative
reading gives you a different (and wrong) answer.

## review1 — the gift guide

Literals in a SELECT list produce the same value on every row, which is how
you tag which branch a row came from. This little trick is the foundation of
a surprising amount of real reporting SQL — it is how you build a union of
heterogeneous sources that a downstream consumer can still tell apart, and
it is what `GROUPING SETS` (lesson 50) automates.

## Further reading

- [Combining Queries](https://www.postgresql.org/docs/16/queries-union.html) — `UNION`, `INTERSECT`, `EXCEPT`, their `ALL` variants, and the precedence rules.
- [`SELECT` — the `UNION`/`INTERSECT`/`EXCEPT` clauses](https://www.postgresql.org/docs/16/sql-select.html) — the reference-page detail on column matching and where `ORDER BY` may appear.
- [Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) — `EXISTS`, `IN`, `ANY`/`ALL`: the other way to express membership, with different NULL and performance behaviour. Preview of lesson 13.
- [Sorting Rows](https://www.postgresql.org/docs/16/queries-order.html) — why `ORDER BY` after a set operation sorts the whole result and how to sort one branch.
