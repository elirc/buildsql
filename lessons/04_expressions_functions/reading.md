# Reading - 04_expressions_functions

A production report is mostly *expressions over columns*, not columns. The
decision this lesson is really teaching is **where** a derived value should
be computed — and the answer is "in the query" far more often than people
who are comfortable in Python assume.

## Notes

**Expressions are evaluated per row, and their types are inferred.**
`price * 1.2` on a `numeric(10,2)` column produces `numeric` and stays
exact; the same expression on a `double precision` column produces binary
floating-point error. PostgreSQL will not warn you, because both are legal.
Types are the quiet half of every expression you write.

**`CASE` is an expression, not a statement.** It evaluates to a value, so it
can go anywhere a value can: the SELECT list, a `WHERE` clause, an
`ORDER BY`, inside an aggregate (lesson 17 builds pivots this way), even
inside a `GROUP BY`. Branches are tested top to bottom and evaluation stops
at the first true `WHEN`, which is why the ladder in ex1 does not need
`price >= 50 AND price < 200` in its second branch. Omitting `ELSE` does not
raise an error — it produces NULL, which is a very common source of
mysterious NULLs downstream.

**`coalesce` is not a NULL-fixer, it is a display decision.** Replacing a
missing manager with `0` is correct for a CSV export and wrong for an
average: `avg(coalesce(salary, 0))` quietly counts unknown salaries as zero
and drags the mean down, whereas `avg(salary)` — which skips NULLs — answers
the question people actually asked. Reach for `coalesce` at the edge of the
system, where a human or a file format needs a value; leave the NULLs intact
while you are still computing. Related: `nullif(a, b)` is the inverse, and
`nullif(divisor, 0)` is the standard way to make a division return NULL
instead of raising a division-by-zero error.

**Casting is explicit on purpose.** `'x' || 5` is an error because
PostgreSQL will not guess whether you meant text concatenation or something
else. `::text` (or the standard `CAST(5 AS text)`) says what you meant. The
same strictness is why `'2023-01-01'::date` and `'{"a":1}'::jsonb` work — a
cast is how a literal string becomes a typed value.

**Expressions and indexes.** A filter written as `WHERE lower(name) = 'ana'`
cannot use an ordinary index on `name`, because the index stores `name`, not
`lower(name)`. PostgreSQL can index the *expression* instead — `CREATE INDEX
ON customers (lower(name))` — and lesson 40 is entirely about it. Keep that
in your pocket: a computed column is not automatically slow, but it is
automatically un-indexed until you say otherwise.

## ex1 — price tiers with CASE

The classic ladder. Worth noticing that the boundary conditions are stated
in the prompt as "under 50" and "from 50 up to but not including 200" —
half-open intervals, exactly as `<` and `<` in the ladder produce. Whenever
a stakeholder describes buckets in prose, pin down the endpoints before you
write the `CASE`; off-by-one bucket boundaries are one of the most common
silent reporting bugs.

## ex2 — building display text

`round(salary, -3)` is the surprise. A negative scale rounds to the *left*
of the decimal point — to the nearest thousand here. It is a genuinely
useful trick for banding numbers in reports, and it is far less error-prone
than a `CASE` ladder with eight branches.

## ex3 — filling a hole with COALESCE

One row in five hundred. That is the ratio that makes NULL dangerous: a
transformation can look perfect across your entire test output and still be
wrong on the row that matters. Lesson 05 turns this from a display concern
into a logic concern.

## ex4 — building an SKU

`||` refusing to concatenate an integer is the language being pedantic in
your favour. In a weakly-typed language, `'BOO-' + 4242` might produce
`'BOO-4242'` or `4242` or an exception depending on the day; SQL makes you
say which one you meant. Note also that this SKU is a *derived* value — it
is not stored, it cannot drift out of sync with the category, and every
consumer that runs this query agrees on its definition. That is the argument
for computing in SQL, and lesson 27 (views) is how you stop repeating it.

## challenge — a nested label

Function composition plus the cast. If you fought with the em dash, that is
a real-world detail too: string literals are bytes with an encoding, and
`' — $'` only round-trips because the database, the client and the terminal
agree on UTF-8.

## review1 — a discounted price

`round(price * 0.9, 2)`. Two things to check yourself on when this returns:
that you rounded *after* multiplying, and that the result is still `numeric`
rather than a float. Money that has been through a `double precision` at any
point in its life is money you cannot reconcile.

## Further reading

- [Conditional Expressions](https://www.postgresql.org/docs/16/functions-conditional.html) — `CASE`, `COALESCE`, `NULLIF`, `GREATEST`, `LEAST`. Short page, high value.
- [String Functions and Operators](https://www.postgresql.org/docs/16/functions-string.html) — `left`, `substring`, `concat`, `format`, and the difference between `||` and `concat()` when an argument is NULL.
- [Mathematical Functions](https://www.postgresql.org/docs/16/functions-math.html) — including `round`'s two-argument form and what a negative scale does.
- [Type Conversion](https://www.postgresql.org/docs/16/typeconv.html) — the rules PostgreSQL uses when it *can* infer a cast, and why it refuses to for `||`.
