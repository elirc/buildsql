# Reading - 58_drills_where_2

Boolean composition, drilled. Every problem here is one bracket away from a
different question, which is the entire point.

## Notes

The rule that generates this whole set: **`AND` binds tighter than `OR`**, so
`a OR b AND c` parses as `a OR (b AND c)`. It matches arithmetic - `AND` is
the `*`, `OR` is the `+` - it is standard across every SQL dialect, and it is
responsible for an enormous number of production bugs, because the wrong
reading is usually *more* rows rather than an error.

The second tool is **De Morgan's laws**, which tell you what happens when you
push a `NOT` inside brackets: `NOT (a OR b)` becomes `NOT a AND NOT b`, and
`NOT (a AND b)` becomes `NOT a OR NOT b`. The conjunction and the disjunction
swap places. Getting this backwards produces a predicate that is true for
almost every row - the classic `country <> 'US' OR country <> 'GB'`, which no
row on earth can fail.

Both rules are safe here for a reason worth naming: every column these drills
filter on is declared `NOT NULL`. In three-valued logic `NOT unknown` is
still `unknown`, and a row whose predicate is unknown is discarded exactly
like a false one, silently. That is lesson 05's subject, and these drills are
the before picture.

## ex1 - two conditions, both required

The baseline: a conjunction of two independent tests. This exists so the
later problems have something to contrast against. The classic mistake at
this level is reaching for `OR` because the prompt used the word "and" only
once - read the requirement as "both of these are true of the row". The model
answer joins the two comparisons with `AND`; swapping their order is
identical in meaning and in plan.

## ex2 - two conditions, either will do

This tests disjunction, and the fact that `OR` is not a union of two result
sets - a row satisfying both branches still appears once. The classic mistake
is worrying about duplicates and adding `DISTINCT`, which cannot help and
costs a sort. The model answer uses a plain `OR`. The reference solution
writes the same predicate through De Morgan's laws, which is worth reading
once as a preview of ex6.

## ex3 - negating one test

This tests negation in its simplest form and flags the hazard that makes it
interesting later. The classic mistake is assuming `<> 'sales'` means
"everything else" on any column - it means that only when the column cannot
be NULL, since an unknown comparison is discarded like a false one. The model
answer negates the equality directly. Try the same shape on a nullable column
in lesson 05 and watch rows disappear.

## ex4 - the bracket that changes the question

The precedence trap, walked into deliberately. This tests whether you bracket
a disjunction before joining it to anything with `AND`. The classic mistake
returns every shipped order at any price, because the unbracketed form parses
as `shipped OR (cancelled AND cheap)`. The model answer brackets the `OR`.
The reference uses `IN`, which is the same predicate with no precedence left
to get wrong - usually the better production answer.

## ex5 - one category, two extremes

The mirror image of ex4: here the `OR` is on the numeric side. This tests the
same precedence rule from the other direction, which is worth drilling
separately because the unbracketed failure looks different - you get
expensive products from categories you never asked about. The model answer
brackets the two price comparisons. The reference reaches for `NOT BETWEEN`,
which expresses "outside this range" with no brackets at all.

## ex6 - pushing NOT inside brackets

This tests De Morgan's laws in the direction people get wrong. The classic
mistake is `<> 'sales' OR <> 'support'`, a predicate that is true for every
row ever stored, and which therefore looks like the filter simply did not
run. The model answer negates the whole disjunction; the reference shows the
distributed form with the connective correctly flipped to `AND`. When a
negated filter returns the whole table, this is almost always why.

## ex7 - two branches, each with two conditions

This tests composing a disjunction of conjunctions, the shape almost every
real eligibility rule takes. The classic mistake is factoring the categories
out - `category IN ('toys','books') AND (price > 450 OR price < 30)` - which
looks tidier and is a different question, since it admits cheap toys and
expensive books. The model answer keeps each rule intact. Note that the
brackets here are for the human, not the parser.

## ex8 - negating a compound predicate

The hard version, and a fair interview question: a negation over a
disjunction where one branch is itself a range. This tests both De Morgan
steps at once, since the `OR` becomes an `AND` and the `BETWEEN` splits into
two strict comparisons that must then be re-bracketed. The classic mistake is
distributing the `NOT` over only the first branch. The model answer negates
the whole thing in place, which is both correct and easier to review.

## Further reading

- [Logical Operators](https://www.postgresql.org/docs/16/functions-logical.html) - the truth tables for `AND`, `OR` and `NOT`, including the unknown column.
- [Operator Precedence](https://www.postgresql.org/docs/16/sql-syntax-lexical.html#SQL-PRECEDENCE) - the authoritative table; `AND` above `OR` is the row that matters here.
- [The WHERE Clause](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-WHERE) - a reminder that only rows whose condition is *true* survive - not merely not-false.
- [Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) - the operators being combined, and what each one returns for a NULL input.
