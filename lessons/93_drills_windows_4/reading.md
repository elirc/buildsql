# Reading - 93_drills_windows_4

Eight drills on bucketing with `ntile`, on percentages of a partition, and on
windows computed over joined rows. Read after your attempt, pass or fail.

## Notes

`ntile(b)` sorts the partition and cuts it into `b` groups as equal as
possible. Two properties are worth internalising. It divides by **row count**,
not by value - a decile of customers always holds a tenth of the customers,
however lopsided their order counts are, which is exactly why decile reports
are useful for comparing populations and useless for finding natural
breakpoints in a distribution. And when the row count does not divide evenly,
the remainder goes to the **earliest** buckets: twelve rows into five buckets
gives 3, 3, 2, 2, 2, not 2, 2, 2, 3, 3, and not some arbitrary spread. That
rule is what makes `ntile` reproducible and also what makes it impossible to
imitate with a naive `row_number() * b / count(*)` expression, which
distributes the remainder differently. Because the buckets are defined
positionally, the window's `ORDER BY` must be fully deterministic or the
boundaries move between runs. The other half of the set is the share-of-
partition idiom - a value divided by `sum(value) OVER (PARTITION BY ...)` -
which works identically whether the rows came from one table or from a
three-way join, because a window function sees whatever rows the `FROM` and
`WHERE` clauses produced and does not care where they came from.

## ex1 - salary quartiles inside each department

`ntile` with a partition gives every department its own four buckets, so
"quartile 1" means top quarter *of that department* and the salary ranges
differ from department to department. This is the right shape for a fairness
review and the wrong shape for "who are the best paid people in the company",
which needs an unpartitioned window. The classic mistake is omitting the `id`
tie-break: two colleagues on identical salaries would then be assigned to
buckets in whatever order the sort produced.

## ex2 - what each company-wide quartile looks like

Grouping by a bucket requires computing the bucket first, in a CTE or derived
table, for the same reason ranking requires it - the window has not run when
`GROUP BY` does. With 500 staff and 4 buckets the split is exactly 125 each,
which makes this the one exercise in the set where the remainder rule does not
show itself. Reading `min_salary` and `max_salary` down the four rows shows
the shape of the pay distribution far better than a single average does.

## ex3 - each line's share of its order

A window over joined rows, which is the whole point: `PARTITION BY
oi.order_id` groups the rows the join produced, and the join to `products`
adds a column without disturbing them. Because an order can contain the same
product twice, the ordering has to use the order item's own `id` to be
deterministic. The percentages inside an order sum to 100, and the reference's
join to a derived per-order aggregate shows what the window is saving you: a
second pass over `order_items`.

## ex4 - twelve countries into five buckets

The `countries` column reads 3, 3, 2, 2, 2 - the remainder of 12 divided by 5
lands in the first two buckets. Knowing this is not trivia: it means the top
bucket of an `ntile` is never smaller than the bottom one, so "top decile"
comparisons are always at least fair to the bottom. It also means `ntile` on a
small result set is a blunt instrument; with twelve rows, bucket boundaries
say very little about the data and a great deal about the arithmetic.

## ex5 - category mix within each price band

Grouping by two keys and partitioning by one of them, with the twist that the
key is an expression - so `floor(price / 100) * 100` has to be written
identically in `GROUP BY` and in `PARTITION BY`, or the two will not match and
the shares will be wrong in ways that are hard to see. This is the strongest
argument for the reference's spelling, which names the band in a CTE and
computes the band totals by grouping that. The `100.0` guards against integer
division, as always.

## ex6 - customer deciles by order count

The standard customer-value report: equal-sized slices of the population,
described by the metric that ordered them plus whatever else is interesting.
Note that `min_orders` and `max_orders` come out very close together across
neighbouring deciles, because order counts per customer cluster tightly around
eleven - which is itself the finding. The revenue column is deliberately not
what the deciles were built on, so it shows how well "orders placed" predicts
"money spent".

## ex7 - the two biggest countries of every month

Three ideas at once: aggregate over a join, a share-of-partition window, and a
top-N-per-partition filter needing its own query level. The `sum(revenue)
OVER (PARTITION BY month)` is computed before the `rn <= 2` filter, which is
essential - if you filtered first, the percentages would be shares of the two
surviving rows and would sum to 100 rather than to the roughly 30% they
actually represent. The reference computes the month totals in a separate CTE
and joins, which makes that ordering explicit.

## ex8 - how much revenue lives in the top quartile

A concentration report, and a good place to notice what is *not* in it: the
300 products that have never been ordered have no row in `order_items`, so
they are absent from the CTE and are never assigned a quartile. If the
question were "of all products", the CTE would need a `LEFT JOIN` from
`products` and a `coalesce(sum(...), 0)`. The top quartile turns out to hold
well under half the revenue, because prices and quantities here are uniform
random rather than the power law that real catalogues follow - on real data
this same query is how you discover the 80/20.

## Further reading

- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) - `ntile`, `percent_rank`, `cume_dist` and the rest of the built-in window functions.
- [Window Function Processing](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-WINDOW) - when windows run relative to `GROUP BY` and `WHERE`.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - the aggregates that double as window functions.
- [Mathematical Functions](https://www.postgresql.org/docs/16/functions-math.html) - `floor`, `round` and the integer-division rules behind the `100.0` in the share columns.
