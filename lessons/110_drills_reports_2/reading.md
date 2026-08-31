# Reading - 110_drills_reports_2

Eight report requests, heavy on cohorts and two-stage aggregation. Read
after your attempt, pass or fail.

## Notes

Almost every request in this set hides the same structural decision: *which
grain do I aggregate at first?* Cohort questions (ex5, ex7) are
per-customer facts rolled up to per-cohort summaries; the distribution
question (ex6) is a per-customer measure histogrammed; the two-ratio
table (ex8) hinges entirely on order-grain versus customer-grain
denominators; even the hall of shame (ex3) is per-product facts filtered
and ranked. Collapse the two
grains into one pass and you get numbers that look plausible and are wrong
- the averaged average, the order counted as a buyer. The other recurring
skill is population honesty: every one of these reports silently excludes
somebody (never-buyers, customers absent from the stream, cohorts without a
full 30-day runway), and the analyst's job is to know exactly who and say
so when handing over the number.

## ex1

A warm-up that is really about restraint: no filter, because the requester
wants cancelled orders *in* the comparison. What it tested: reading intent
before typing WHERE. The classic mistake is reflexively excluding
cancellations because other revenue reports do - here that deletes the most
interesting row. The model answer is a four-row GROUP BY with a rounded
average, nothing more.

## ex2

date_trunc at quarter grain over the full two-year customer table. What it
tested: picking the grain the requester named rather than the one you
usually type, and remembering partial edge buckets. The classic mistake is
labelling quarters by extract(quarter ...) alone, which merges 2022-Q4 with
2023-Q4; date_trunc keeps the year in the key. The first and last quarters
are partial - a chart without that footnote invites a false "growth"
story at the edges.

## ex3

Threshold-then-rank. The HAVING floor (100 reviews or more) is what makes
"worst" mean something - without it a product with one angry review tops
the list. What it tested: HAVING on a count, plus a subtle ordering rule:
sort on the *unrounded* average and tie-break by id, because two products
sharing a rounded 2.71 still differ in truth, and sorting the display value
makes the bottom-ten roster shuffle between runs. Rank on the real number,
display the rounded one.

## ex4

A relative time window: the report anchors on max(ts), not on a date
somebody typed. What it tested: lesson 18's interval arithmetic driving a
lesson 17 FILTER pivot, and the half-open upper bound (last_day + 1 day)
that keeps all of the final day. The classic mistake is WHERE ts >= now()
- interval '3 days' - this dataset's clock stopped in November 2023, and
any report anchored on the wall clock instead of the data returns nothing
and gets blamed on the database.

## ex5

A per-customer deadline. "Within 30 days" means within 30 days *of their
own signup* - the comparison c.created_at + interval '30 days' rides along
per row, which is what makes this a cohort query rather than a date-range
query. The classic mistake is one shared cutoff date, which flatters early
cohorts and starves late ones. The model reasoning: a customer converts
fast iff their first order beats their personal deadline, so min(created_at)
per customer answers it in one pass - and the November cohort has not had
its full 30 days yet, which an honest report says out loud.

## ex6

The aggregate of an aggregate, drilled before on orders (lesson 68) and
here on a 3,000,000-row stream. What it tested: count(DISTINCT ...) at the
inner grain, a histogram at the outer grain, and knowing the population is
"customers who appear in events at all". The classic mistake is joining
customers in and reporting a zero-types row - defensible, but a different
question than the one asked, and the kind of silent scope change that makes
two dashboards disagree.

## ex7

Buyers versus heavy buyers. The inner join to orders quietly implements
"bought at all", and the heaviness test lives at the customer grain (order
count >= 12), then rolls up to the cohort. What it tested: FILTER over a
grouped CTE, denominator discipline - the rate divides heavy by *buyers*,
not by signups - and threshold awareness: the typical buyer here places
about ten orders, so a bar of two would read ~100% and measure nothing.
The classic mistake is counting orders instead of customers somewhere in
the pipeline; the rate then exceeds 100% and, worse, sometimes does not,
so it survives review.

## ex8

Two ratios that differ only in their denominator, which is the entire
point: AOV divides revenue by orders, ARPU divides the same revenue by
distinct buyers, and the gap between them is repeat purchasing made
visible (arpu / aov is literally orders per buyer). What it tested:
running count(*), count(DISTINCT customer_id), and sum(total) through one
grouped pass and dividing carefully at the end. The classic mistake is
using the wrong denominator in one of the two - the report still renders,
the two columns just quietly answer the same question twice, which is
exactly the confusion the requester complained about.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - FILTER, count(DISTINCT ...), and their interaction.
- [Date/Time Functions and Operators](https://www.postgresql.org/docs/16/functions-datetime.html) - date_trunc, interval arithmetic, and extract.
- [WITH Queries (CTEs)](https://www.postgresql.org/docs/16/queries-with.html) - staging multi-grain pipelines readably.
- [Use The Index, Luke - Dates](https://use-the-index-luke.com/sql/where-clause/obfuscation/dates) - why half-open ranges on raw columns beat function-wrapped filters.
