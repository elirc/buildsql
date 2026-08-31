# Reading - 57_drills_where_1

Eight narrowing problems. Nothing here is syntactically hard; every one of
them is a chance to be precise about which rows survive.

## Notes

This set drills the predicates that test a value against a set or a range,
and the skill being trained is **endpoint discipline**. `BETWEEN x AND y` is
inclusive on both ends - it means `>= x AND <= y` - which is convenient for
integers and prices and a genuine hazard for timestamps, where the bare date
`'2023-01-31'` means midnight and therefore excludes almost the whole day.
The professional habit for time ranges is half-open: `>= start AND < next`.

`IN` is `OR` in a smaller box: `status IN ('paid','shipped')` is exactly
`status = 'paid' OR status = 'shipped'`, with the parenthesisation already
correct, which is a quiet argument for preferring it. `NOT IN` is its
opposite only while no NULL is involved - the moment a NULL appears in the
list or in the column, `NOT IN` returns no rows at all rather than the rows
you expected. Nothing in this set has a nullable column on the left, so the
trap stays disarmed; lesson 05 arms it.

One more habit: a comparison against a `date` column and a comparison against
a `timestamptz` column look identical and behave differently. `staff.hired_on`
is a plain `date`, so `< '2015-01-01'` is exactly what it appears to be.

## ex1 - one comparison

This tests strict versus inclusive comparison, the smallest possible version
of the endpoint question that runs through the whole set. The classic mistake
is `<=`, which silently adds the boundary rows and is invisible unless you
count. The model answer uses `<` because "under" is exclusive in English and
the prompt said "strictly". When a spec says "under", "up to", or "through",
ask which endpoints are included before you write the operator.

## ex2 - equality on text

This tests exact text equality, and the restraint not to reach for pattern
matching when a plain `=` is correct. The classic mistake is capitalising the
literal, which returns zero rows and no error. The model answer compares the
column to the exact stored value. A single-value `IN` list is the same
predicate written differently, which is worth seeing once: `IN` really is
just `=` with room for more values.

## ex3 - comparing dates

This tests date comparison and, again, the boundary. The classic mistake is
`<=` on a date boundary, which is how "hired before 2015" turns into "hired
before 2015, plus everyone hired on the first working day of it". The model
answer keeps the comparison strict. Note that `hired_on` is a plain `date`,
so no time component can hide behind the literal - the same predicate on a
`timestamptz` column would need much more care.

## ex4 - a short list of values

This tests `IN` as shorthand for a chain of equalities. The classic mistake
is writing `department = 'sales' OR 'support'`, which is not a syntax error
in every dialect and means something else entirely where it parses. The model
answer lists both values inside one `IN`. The real argument for `IN` is not
brevity but safety: it has no precedence for you to get wrong, which is the
whole subject of the next drill set.

## ex5 - everything outside a list

This tests `NOT IN` and plants a flag for later. The classic mistake is
chaining `<>` with `OR` - `country <> 'US' OR country <> 'GB'` is true for
every row on earth, because no country can be both. The model answer negates
the whole membership test at once. Remember the caveat: `NOT IN` against a
list or subquery containing a NULL returns nothing, silently, and that bug
has shipped in production more than once.

## ex6 - an inclusive range

This tests `BETWEEN` and its inclusivity. The classic mistake is writing the
bounds backwards, which returns zero rows without complaint because `BETWEEN`
is defined as `>= first AND <= second` with no reordering. The model answer
puts the low bound first. Write the expanded form once and keep it in mind:
that expansion is exactly why `BETWEEN` on timestamps is a trap and
`BETWEEN` on prices is not.

## ex7 - a list and a range together

This tests combining a set predicate with a range predicate, and it is the
first place in the set where precedence could bite. The classic mistake is
expanding `IN` to an unbracketed `OR`, which produces every engineer
regardless of salary plus the ops people in band. The model answer keeps the
`IN` intact so no brackets are needed. The planner will apply whichever
condition it estimates is cheaper first, and neither ordering changes the
answer.

## ex8 - excluding the middle

The hard version: a membership test and a negated range in one predicate.
This tests whether you can turn `NOT BETWEEN` into its `OR` form without
losing an endpoint, since both comparisons become strict under negation. The
classic mistake is writing `price < 50 OR price > 450` without brackets, so
`AND` grabs only the first half and the result fills with cheap products from
every category. The model answer keeps `NOT BETWEEN` whole, which has no
precedence to get wrong.

## Further reading

- [Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) - the definitions of `BETWEEN`, `IN`, and `IS DISTINCT FROM`, endpoints included.
- [Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) - what `IN` and `NOT IN` mean once the right-hand side is a subquery, and why NULLs matter there.
- [The WHERE Clause](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-WHERE) - where filtering sits in the logical evaluation order of a query.
- [Date/Time Types](https://www.postgresql.org/docs/16/datatype-datetime.html) - why a bare date literal compared against a timestamp means midnight.
