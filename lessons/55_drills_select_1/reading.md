# Reading - 55_drills_select_1

Eight problems on the clause everyone thinks is trivial. The trivial part is
the syntax; the part that bites is arithmetic types and what `DISTINCT`
applies to.

## Notes

Two ideas unite this set. The first is that **the SELECT list is a per-row
expression list**, not a list of columns: a literal, an arithmetic
expression, or a function call is as legal there as a bare column name, and
the result is computed once per surviving row. The second is that **`DISTINCT`
de-duplicates the whole output row, after those expressions have been
evaluated** - never one named column. That ordering is the source of most
surprises in this set: an expression that collapses many inputs to one value
(integer division, a modulo bucket) makes `DISTINCT` return far fewer rows
than the underlying column has values, and adding one more column to the list
can undo the de-duplication entirely.

The third thing worth internalising is that **arithmetic in SQL is typed**.
`numeric / numeric` keeps decimals; `integer / integer` throws the remainder
away without a warning, because the result type of `int / int` is `int`. That
single rule accounts for an enormous number of "the report says zero" bugs,
and it is why `quantity / 2` and `quantity / 2.0` are different questions.

## ex1 - columns, in the order asked for

This tests whether you read the required output shape before you started
typing. The classic mistake is writing the columns in table order out of
habit and never noticing, because the query runs perfectly and returns
plausible rows. The model answer simply lists the three names in the sequence
the prompt gave, which is also why every prompt in this course spells the
order out: a correctness gate compares tuples by position, exactly like the
CSV consumer downstream of your real query would.

## ex2 - a column that is not in the table

The point is that the SELECT list holds expressions, and a literal is the
simplest expression there is. The classic mistake is reaching for double
quotes, which in SQL name an identifier rather than a string, producing a
confusing "column USD does not exist" error. The model answer puts `'USD'`
straight into the list; PostgreSQL types it as text and repeats it on every
row, which is exactly how flat exports get their constant marker columns.

## ex3 - dividing a salary

This tests numeric division and the discipline of returning exactly what was
asked for. The classic mistake is helpfully rounding to two decimals because
money "should" have two decimals - which silently changes every value in the
column. The model answer divides and stops. Worth noticing in the output: the
quotient carries far more decimal places than the input, because `numeric`
division picks a result scale generous enough not to lose information.

## ex4 - the values a column actually takes

This tests `DISTINCT` in its simplest form and, quietly, your willingness to
run a query that reads the whole of `order_items` to return a handful of
values. The classic
mistake is adding the primary key to the SELECT list "for context", which
makes every row unique again and returns the whole table. The model answer
asks only for the column whose value set you want. `GROUP BY quantity` with
no aggregate is the same question phrased differently, and PostgreSQL plans
both nearly identically.

## ex5 - distinct pairs, NULL included

This tests that `DISTINCT` de-duplicates the entire selected row, and that
NULL is a value it can group. The classic mistake is assuming a NULL will be
dropped, or adding `WHERE manager_id IS NOT NULL` defensively and losing the
one row the org chart most needs. The model answer selects both columns under
one `DISTINCT`. Note the asymmetry that trips people later: `DISTINCT` calls
two NULLs the same, while `=` calls them unknown.

## ex6 - two derived columns from one

This tests computing more than one derived column in a single pass, which is
what report queries actually look like. The classic mistake is computing the
gross as `price + price * 0.2` and assuming it must equal `price * 1.2` - it
does here, but only because both sides land on the same numeric scale, and
that is a coincidence you should not rely on. The model answer writes the two
multiplications side by side and lets the SELECT list do the work once.

## ex7 - the division that throws away the remainder

This tests the single most expensive type rule for beginners: `integer /
integer` is integer division, so `1 / 2` is `0` and no warning is issued. The
classic mistake is writing the average of an integer column as a division by
an integer literal and shipping a report full of zeros. The model answer puts
both forms side by side so the difference is visible in one glance. Note also
that `DISTINCT` runs after the expressions, which is why the whole reviews
table collapses to five rows.

## ex8 - bucketing with modulo

This is the whole set in one query: an arithmetic expression that collapses
many inputs into a few outputs, with `DISTINCT` applied after it. The classic
mistake is leaving `price` in the SELECT list alongside the band, which makes
every row unique again and returns the entire catalog. The model answer
computes `price - price % 100` and de-duplicates the pairs. `%` on `numeric`
is exact here, which is precisely why this bucketing trick is safe on money
and would not be on a floating-point column.

## Further reading

- [SELECT Lists](https://www.postgresql.org/docs/16/queries-select-lists.html) - what may appear between SELECT and FROM, and how output column names are decided.
- [DISTINCT Clause](https://www.postgresql.org/docs/16/queries-select-lists.html#QUERIES-DISTINCT) - the exact rule: duplicate elimination happens on the whole result row.
- [Numeric Types](https://www.postgresql.org/docs/16/datatype-numeric.html) - why integer division truncates and what precision `numeric` promises.
- [Mathematical Functions and Operators](https://www.postgresql.org/docs/16/functions-math.html) - the `%` operator and friends, including their behaviour on `numeric`.
