# Reading - 20_querying_capstone

Part 2 is over. Six exercises here, and none of them needed a construct you
had not already met — what they needed was decomposition: *define the
population, define the time grain, define the measure*. That is the skill
seniors interview for, and it survives every tool change.

## Notes

**Every metric hides a population.** "DAU" means distinct customers who did
*something* — but something on the site, or something that counts as
engagement? "Conversion" means bought — ever, or within the cohort window?
"Repeat rate" divides by buyers or by all customers, and the two numbers can
differ by a factor of two. None of these are SQL questions. All of them
determine which SQL is correct.

**Aggregating an aggregate needs two stages.** Average basket size is the
canonical example: count items per order, *then* average. Doing it in one
step — dividing total items by distinct orders — gives the right answer only
when the distribution is uniform, and quietly wrong ones otherwise. Whenever
a metric is "the average of a per-thing number", the query has two `GROUP
BY`s in it, one nested in the other.

**Volume and reach come apart.** `count(*)` and `count(DISTINCT
customer_id)` answer different questions, and every funnel, engagement
metric and "top pages" report has to pick one deliberately. A step where
people repeat themselves — page views, retries, add-to-cart — looks
dramatically bigger in volume than in reach.

**Percent change needs a guard.** `100 * (b - a) / a` errors when `a` is
zero and returns NULL when `a` is NULL. `nullif(a, 0)` turns the first into
the second. On a category league table with six well-populated rows this
never fires; on the same query segmented by country and week, it fires in
production on a Sunday.

**Cohort analysis is a join between two grains.** A cohort report has one
row per (cohort, measure) but is built from customer rows and order rows.
The safe construction is the one from lesson 14: aggregate each grain
separately, then join the small results — rather than joining first and
trying to un-duplicate afterwards.

**Say what the denominator is, in the column name.** `repeat_pct` is
ambiguous; `repeat_pct_of_buyers` is not. The cheapest defence against a
metric argument six months from now is a column name that already answered
it.

## ex1 — daily active customers

`count(DISTINCT customer_id)` per day over three million events. Note the
prompt's aside that no series is needed here because every day has traffic —
which is a fact about this dataset, not a property of the query. The same
query on a quieter table silently omits empty days, and lesson 18's
`generate_series` pattern is the fix.

## ex2 — signup cohorts that actually buy

Two populations at two grains: customers by signup month, and whether each
has ever ordered. `EXISTS` is the natural expression of "has ever" — it
short-circuits and cannot fan out — and it is why the `count(DISTINCT ...)`
version, while correct, is doing more work to say something less clearly.

## ex3 — top movers, September to October

`FILTER` turns a two-month comparison into a single pass, and the percent
change is the fragile part. Six categories all have September revenue, so
the division is safe; the habit of writing `nullif(sep_rev, 0)` anyway costs
nothing and removes the failure mode permanently.

## ex4 — "What does a week of traffic look like?"

Volume against reach, on the same rows. Look at the ratio per event type:
`view` has many more events than customers, `logout` far fewer. That ratio
*is* the engagement story, and it is invisible if a report shows only one of
the two columns.

## ex5 — "Who are our loyal customers?"

Aggregate, then aggregate again. Two definitions are buried in one sentence,
and both move the answer more than any amount of query tuning could. The
denominator excludes the 5,003 customers who have never ordered — defensible
here, and a different number from "share of all customers". And the
threshold was picked by the person asking: at two or more orders essentially
every buyer qualifies on this dataset, at fifteen about one in six does, at
twenty roughly one in ninety. A metric with a hand-chosen cutoff is an
argument dressed as a measurement, and the honest way to publish it is with
the cutoff in the column name.

This is also the exercise where a sanity check pays: the average customer
here has eleven orders, which is wildly unlike a real shop. Noticing that
your data does not look like the world is a skill worth more than most SQL —
a "repeat purchase rate" of 100% is not a triumph, it is a signal that
somebody generated the data.

## ex6 — "Are baskets getting bigger?"

The two-stage average, and the trap spelled out. Worth running the wrong
version once in the lab to see how close it looks — the collapsed
calculation produces a plausible number in the same range, which is exactly
why this error survives code review.

## review1 — purchases per day

The simplest query in the lesson, deliberately, as the spaced-review anchor
for the whole of Part 2. When it comes back, notice that you can now write
it without thinking — and that "without thinking" is what the last eight
lessons were for.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) — worth a final pass now that you have used `FILTER`, `DISTINCT` and ordered-set aggregates in anger.
- [`WITH` Queries](https://www.postgresql.org/docs/16/queries-with.html) — re-read the inlining notes; every query in this lesson is a CTE pipeline.
- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) — the reference you will keep open for the rest of your career.
- [Use The Index, Luke](https://use-the-index-luke.com/) — start reading it now. Everything you wrote in Part 2 reads whole tables, and Part 5 is about to explain what that costs and how to stop.
