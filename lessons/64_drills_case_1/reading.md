# Reading - 64_drills_case_1

Conditional expressions, drilled. `CASE` is easy to write and easy to get
subtly wrong, and every problem here targets one of the specific ways.

## Notes

`CASE` comes in two forms. The **searched** form takes a full condition per
branch - `CASE WHEN price < 50 THEN ... END` - and is what you want almost
always. The **simple** form compares one expression against a list of
values, as in `CASE department WHEN 'sales' THEN ... END`; it reads
beautifully for an enumeration and cannot express a range or a compound test
at all.

Three rules govern the rest. **Evaluation stops at the first true branch**,
so a ladder is implicitly nested: the second `WHEN` already knows the first
was false, which is why `WHEN price < 50` followed by `WHEN price < 200`
means "50 up to 200" without you writing the lower bound. Reverse those two
branches and the second becomes unreachable - the query still runs, and every
mid-priced product is silently labelled as budget.

**Without an `ELSE`, unmatched rows get NULL.** Not an error, not a default
string - NULL, which then propagates through any `||` it meets and disappears
from any `= 'x'` comparison downstream. Omit the `ELSE` when you mean NULL,
and write it when you do not.

**All branches must share one type.** The `THEN` values and the `ELSE` are
unified into a single result type by the same rules that govern `coalesce`,
so a ladder mixing `'unknown'` with a numeric price will not compile until
you decide which one it is.

## ex1 - two branches

The baseline: a two-branch conditional with an explicit `ELSE`, so every row
gets a label. This tests the syntax and the boundary at once. The classic
mistake is forgetting `END`, which produces a syntax error pointing at the
wrong place. The model answer covers both cases explicitly. The reference
inverts the condition and swaps the arms, which is the same rule written from
the other side - both are fine, and neither leaves a row unlabelled.

## ex2 - the simple form

This tests the simple `CASE` form, which reads well for an enumeration and is
worth recognising in other people's SQL. The classic mistake is mixing the
two forms - writing `CASE department WHEN department = 'sales'`, which
compares the department to a boolean and fails. The model answer keeps the
expression in the header and bare values in the branches. The reference shows
the searched form with `IN`, which is what you would usually write once more
than two values are involved.

## ex3 - no ELSE on purpose

This tests the default behaviour of an unmatched `CASE`, which is the source
of an entire family of production bugs. The classic mistake is the opposite
one: omitting `ELSE` by accident in a ladder that was supposed to be
exhaustive, so unclassified rows silently become NULL and then vanish from
every downstream `WHERE label = 'x'`. The model answer omits `ELSE`
deliberately, which is the only reason it is correct.

## ex4 - branch order decides everything

This tests first-match evaluation, the property that makes ladders concise
and makes a misordered ladder silently wrong. The classic mistake is sorting
the branches from lowest threshold upwards, which makes every branch after
the first unreachable without any warning at all. The model answer descends.
The reference ascends with the comparisons flipped, which is the same rule
written the other way round - and shows that only the *combination* of order
and operator is correct or not.

## ex5 - a CASE that returns a number

This tests a `CASE` used as a value rather than a label, and the type
unification across its arms. The classic mistake is treating `CASE` as a
statement and trying to "do nothing" in the else branch - there is no doing
nothing in an expression, so the untouched rows must explicitly return
`price`. The model answer supplies both arms as numeric expressions.
Conditional pricing like this is exactly what lesson 17 generalises into
pivots.

## ex6 - a CASE over a NULL

This tests `IS NULL` inside a `CASE` and the cast that concatenation demands.
The classic mistake is `WHEN manager_id = NULL`, which is never true, so the
CEO falls through to the `ELSE`, concatenates against a NULL, and comes back
as NULL rather than as `CEO`. The model answer tests with `IS NULL`. The
reference exploits that same NULL propagation deliberately - the
concatenation is NULL exactly for the CEO, so `coalesce` supplies the label.

## ex7 - two ladders in one row

This tests holding two independent conditional rules in one select list, and
choosing the right `CASE` shape for each: a threshold ladder for the numeric
one, an enumeration for the categorical one. The classic mistake is a missing
`END`, which makes the parser blame the next column entirely. The model
answer keeps the two expressions separate and complete. Reaching for a
five-branch ladder where a lookup table belongs is a design question worth
asking in real work.

## ex8 - a CASE inside a CASE

The hard version: a two-dimensional rule expressed as a conditional. This
tests whether you can see that a nested `CASE` and a flat four-branch ladder
are the same rule, and that the flat form's correctness depends entirely on
branch order. The classic mistake in the flat form is putting the
category-only branch first, which makes the expensive-electronics branch
unreachable. The model answer nests, so each dimension is handled where it
belongs and no ordering is load-bearing.

## Further reading

- [Conditional Expressions](https://www.postgresql.org/docs/16/functions-conditional.html) - the definitive description of both CASE forms, plus COALESCE, NULLIF and GREATEST.
- [Type Conversion - UNION, CASE and Related Constructs](https://www.postgresql.org/docs/16/typeconv-union-case.html) - the exact rule for unifying the types of every CASE branch.
- [Expression Evaluation Rules](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-EXPRESS-EVAL) - why CASE is one of the few places where PostgreSQL guarantees evaluation order.
- [Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) - what each WHEN condition returns when its input is NULL, and why that is not a true branch.
