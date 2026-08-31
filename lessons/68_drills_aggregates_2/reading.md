# Reading - 68_drills_aggregates_2

Eight drills on aggregate arithmetic. Read them after your attempt - several
of these have a right answer and a plausible wrong one that differ by a rule
rather than by a typo.

## Notes

Once the rows are chosen, an aggregate is just arithmetic, and the arithmetic
has an order of operations that most reporting bugs violate. Multiply before
you sum (`sum(a * b)`), because the product is a property of the row. Divide
after you sum (`sum(a) / sum(b)`) when you want a weighted average, because
the weights live in the denominator - and note that this is a different
number from `avg(a / b)`, which weights every row equally. Decide explicitly
whether missing rows should count as zero: `avg(x) FILTER (WHERE cond)`
averages the matching rows, `avg(CASE WHEN cond THEN x ELSE 0 END)` averages
all of them with zeros filled in, and the two answers can differ by a factor
of two. And when a question needs an aggregate of an aggregate - the average
of a count, the maximum of a sum - the inner one has to finish in a subquery
or CTE first, because aggregates cannot nest.

## ex1 - one product's reviews

A warm-up, but with one real point in it: `avg` over an integer column
returns numeric rather than truncating, which is why `avg(rating)` can be
3.04 even though no rating ever is. The classic mistake is computing an
average as `sum(rating) / count(*)` without a cast, which in integer
arithmetic floors the result to 3 and looks almost right. Model answer: use
`avg`, and round only because the prompt asked for two decimals.

## ex2 - the shape of the customer table

This is the query to run first whenever you meet an unfamiliar table: how
many rows, how many distinct values in the column you plan to group by, and
what period it covers. Those three numbers tell you whether a `GROUP BY
country` will return a readable dozen rows or fifty thousand. The classic
mistake is skipping it and discovering the cardinality from a report that
scrolls for a minute. Model answer: one pass, four aggregates, no subqueries.

## ex3 - units, revenue, and the average line

Two averages hide in every line-item table and they answer different
questions: the average value of a line, and the average price of a unit. This
drill asks for the first, which weights every line equally regardless of how
many units it moved. The classic mistake is treating them as interchangeable
in a summary table, so that two numbers which should agree do not, and nobody
can say why. Model answer: `avg(quantity * price)`, and say in the column
name what the row unit is.

## ex4 - zero-filled average versus filtered average

The most consequential one-character difference in reporting SQL: an `ELSE 0`
that should have been an `ELSE NULL`. Both queries are legitimate - "average
revenue per order including the ones that did not pay" is a real metric - but
they differ by roughly the paid share of the table, and only one of them can
be labelled "average paid order value". The classic mistake is copying a
`sum(CASE ... ELSE 0 END)` idiom, which is correct for sums, straight into an
`avg`, where the zeros are extra rows in the denominator. Model answer:
`FILTER` when you want the population restricted, `ELSE 0` only when you
really want the zeros counted.

## ex5 - weighted versus unweighted

The distinction between a weighted and an unweighted average is the one that
turns up in every price, rate and score aggregation, and the difference is
which unit the average is "per". `avg(price)` is the average price per line
of paperwork; `sum(qty * price) / sum(qty)` is the average price per unit
sold. The classic mistake is quoting the first as though it were the second,
which biases the answer towards products that sell one at a time. Model
answer: sum the numerator, sum the denominator, divide once.

## ex6 - distinct counting with a filter on top

Three flavours of counting in one row, and each is a different question about
the same half-million orders: how many transactions, how many people, how
many people in one segment, how many periods. The one that surprises people
is the last - counting distinct values of an expression is how you measure
coverage without grouping. The classic mistake is `count(DISTINCT *)`, which
does not exist, or assuming `FILTER` has to come before `DISTINCT`. Model
answer: DISTINCT inside, FILTER outside.

## ex7 - a share of the total, in one pass

"X as a percentage of the total" is the single most requested column in
reporting, and inside one aggregate query it needs no subquery at all: the
filtered aggregate is the numerator, the unfiltered one is the denominator.
The classic mistakes are two - integer division flooring the result to zero,
and rounding the inputs before dividing, which introduces error that then
gets multiplied by a hundred. Model answer: `100.0 *` filtered `/`
unfiltered, `round` once at the end.

## ex8 - the aggregate of an aggregate

Distribution questions - biggest, smallest, average per entity - are always
two-stage, and the stage boundary is the thing to see: the inner query
decides what one row means (one product), the outer query summarises those
rows. Because the join filters to `food` before grouping, `count(*)` in the
outer query counts food products with reviews, not all food products; a
product with zero reviews cannot appear in an inner-joined result at all,
which is a limitation worth naming rather than papering over. The classic
mistake is nesting the aggregates directly and reading the error message as a
syntax problem instead of a levels problem.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - return types matter here: `avg` over integers gives numeric, `sum` over numeric stays numeric.
- [Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) - the reference for the scalar subqueries used in the last two drills.
- [`WITH` queries (CTEs)](https://www.postgresql.org/docs/16/queries-with.html) - the readable way to stage an inner aggregate before aggregating it again.
- [Numeric Types](https://www.postgresql.org/docs/16/datatype-numeric.html) - integer division, numeric precision, and why money is `numeric` in this schema.
