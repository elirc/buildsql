# Reading - 67_drills_aggregates_1

Eight single-row drills on the standard aggregates. Read after attempting
them, pass or fail.

## Notes

An aggregate query with no `GROUP BY` collapses its whole input to one row,
and the interesting decisions are all about what goes into that collapse.
Three of them recur through this set. What is being counted: rows
(`count(*)`), non-NULL values (`count(col)`), or distinct values
(`count(DISTINCT col)`), each a different number over the same column.
Which rows participate: a `WHERE` clause restricts the whole query, while
`FILTER (WHERE ...)` restricts one aggregate, which is how several different
slices land in one row. And what type comes out: `count` gives bigint, `sum`
and `avg` over numeric give numeric, and `avg` over an integer column gives
numeric too - so `100.0 * a / b` and `100 * a / b` are different queries, and
only one of them is right.

## ex1 - the shape of one category

The standard four-number summary, and the query you should be able to type
without thinking. Worth noticing: `price` is `NOT NULL`, so `count(*)` and
`count(price)` agree here - which is precisely why they cannot teach you
anything on this table, and why the next drills use columns where they
differ. The classic mistake is rounding with a single-argument `round`, which
takes the average to a whole number. Model answer: filter once in `WHERE`,
aggregate four times, round only for display.

## ex2 - how many rows, how many things

`count(*)` and `count(DISTINCT col)` answer questions that sound the same in
English and are not: the number of complaints versus the number of products
complained about. The gap between them is the average number of complaints
per affected product, which is usually the number somebody actually wanted.
The classic mistake is quoting the row count as though it were a count of
things. Model answer: one query, two counts, and a `WHERE` clause shared by
both.

## ex3 - summing a computed column

The most common arithmetic error in reporting SQL is aggregating before
multiplying. `sum(a * b)` adds up the per-row products; `sum(a) * sum(b)`
multiplies two unrelated totals and produces a number with no meaning, but
one that looks plausible enough to survive review. The classic mistake is
exactly that swap, usually introduced while "simplifying" a query. Model
answer: compute the per-row value inside the aggregate, because the line
value is a property of the line.

## ex4 - min and max on timestamps

Knowing the time span of a fact table is the first thing to establish before
writing any date-filtered report, and it is two aggregates. The subtlety is
the arithmetic: `date - date` yields an integer count of days, while
`timestamptz - timestamptz` yields an interval such as `364 days 21:56:03`,
which cannot be compared with a plain number. The classic mistake is mixing
the two and then trying to round an interval. Model answer: cast to `date`
first when you want whole days.

## ex5 - several slices, one row

`FILTER` is what makes single-row dashboards possible: one pass over the
table, four different populations, no subqueries and no self-joins. Before it
existed people wrote `sum(CASE WHEN cond THEN 1 ELSE 0 END)`, which still
works and is worth being able to read. The classic mistake is putting the
slice condition in `WHERE` instead, which silently restricts every other
column in the row too. Model answer: `WHERE` for the population the whole
query is about, `FILTER` for the population one number is about.

## ex6 - distinct counts skip the NULLs

The asymmetry drilled here is worth memorising: `SELECT DISTINCT manager_id`
returns a NULL row, while `count(DISTINCT manager_id)` does not count it, so
the length of the first is one more than the value of the second. Both are
correct; they answer "how many different entries are there" and "how many
different managers are there". The classic mistake is deriving one from the
other and being off by one, which in a small company is invisible and in a
report is wrong.

## ex7 - a percentage that is not zero

The integer-division trap is the reason this drill exists: `100 * a / b`
evaluates left to right, so with bigint counts you get an integer percentage,
and `a / b * 100` gives you a flat zero. Writing `100.0` promotes the
expression to numeric before the division happens. The classic mistake
survives code review because a percentage of 16 instead of 16.66 looks like a
rounding choice. Model answer: one decimal point in the constant, and
`FILTER` for the numerator so the denominator still sees every row.

## ex8 - an average of counts

"Average per entity" always means two levels of aggregation, and the second
level is where the zeros are decided. With an inner join, orders with no
items never reach the outer average and the answer comes out too high; with
`count(*)` instead of `count(oi.id)`, the NULL-extended row counts as one
item and the answer comes out too high again, differently. The classic
mistake is dividing two grand totals instead - `count(items) / count(orders)`
- which happens to be right here but breaks the moment the prompt asks for a
median or a maximum. Model answer: aggregate per order, then aggregate the
aggregates.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - the full table, with the return type of each aggregate and the note that they all ignore NULL inputs.
- [Aggregate Expressions](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-AGGREGATES) - where `DISTINCT`, `ORDER BY` and `FILTER` may appear inside an aggregate call.
- [`FILTER` explained](https://modern-sql.com/feature/filter) - Markus Winand on why `FILTER` replaced `sum(CASE ...)`, with portability notes.
- [Numeric Types](https://www.postgresql.org/docs/16/datatype-numeric.html) - integer division, and why `numeric` is the money type in this schema.
