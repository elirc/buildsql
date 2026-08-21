# Reading - 12_fundamentals_capstone

Part 1 is over. The SQL in this capstone is nothing you have not already
written; what is new is that nobody told you which tables to use. That
translation step — from a sentence a human said to a query with a defensible
definition in it — is the actual job.

## Notes

**Every one of these requests contained a hidden definition.** "Real
revenue" meant paid and shipped, and the requester did not think that needed
saying. "Never bought anything" could mean *never*, or *not in the period* —
two different queries, both defensible, one of them wrong for this request.
"Last quarter" means one thing on July 1st and another on October 1st. The
single most valuable question a data person asks is **"what exactly
counts?"**, and it is asked before writing SQL, not after the number is
questioned.

**Half-open ranges, permanently.** `created_at >= '2023-07-01' AND
created_at < '2023-10-01'` is correct; `BETWEEN '2023-07-01' AND
'2023-09-30'` silently excludes almost all of September 30th, because a bare
date is midnight. Half-open ranges also compose without gaps or overlaps —
consecutive quarters tile the timeline exactly — which is why every date
filter in this course is written that way. Lesson 18 makes the timezone
version of this argument.

**Aggregates over joins need the grain checked, every time.** In ex6 the
join to `order_items` multiplies each order by its line count, which is
exactly what you want because you are summing line quantities. Sum
`o.total` over that same join and you would count each order once per line
and report revenue inflated by the average basket size. The rule from lesson
08 in one sentence: *know how many rows one input row became before you
aggregate*.

**Report the denominator.** A "top five products" list is meaningless
without the population it was drawn from, and a churn list is meaningless
without the cohort size. When you hand a stakeholder a list, hand them the
count it came out of too. This is not politeness — it is the cheapest
possible defence against a filter bug, for you and for them.

**Partial periods are permanent.** The data ends on 2023-11-14, so November
is a partial month and the trend line drops. Real data does this constantly:
the current month is always partial, and a chart that does not say so
produces a "why is revenue collapsing?" meeting every month. Label them or
exclude them, but never ship them unmarked.

**A note on naming.** `sum(total) AS revenue` is a claim. Somebody will read
that column name and act on it without reading the `WHERE` clause. If the
definition is contested — and revenue always is — encode it in the name
(`paid_revenue`), or put it in a view (lesson 27) where the definition lives
in exactly one place and everyone who disagrees has one thing to argue with.

## ex1 — "How did Q3 go, by status?"

A filter, a group, an order. The interesting part is the shape of the
answer: four rows including `cancelled`, which is revenue that did not
happen. Leaving cancelled orders in a "revenue by status" table is right —
the reader can see what they are excluding. Silently dropping them is what
produces two reports that disagree.

## ex2 — "Who are our whales?"

A join, a filtered aggregate, a top-N. Note the tie-break on `id`: without
it, two customers with identical lifetime spend swap places between runs and
someone eventually notices. Every ordered report needs a total order
(lesson 03).

"Lifetime" is the other buried definition here. It means *all* qualifying
orders regardless of date — so no date filter — which is a decision the
request made in a single word. Had they said "top customers this year" the
same query with one extra condition answers a different business question,
and the two lists will not have the same people on them.

## ex3 — "What actually sells?"

Three tables, and the revenue definition uses the line item's own price
rather than the product's current price. That is the historical snapshot
decision from lesson 08 — using `p.price` here would silently rewrite last
quarter's revenue every time someone edited the catalogue.

## ex4 — "Did our Q3 signups convert?"

The ambiguity exercise. "Never bought anything" is unqualified in the
request and qualified in the prompt, and the two readings produce different
lists. In real life you go and ask. When you cannot ask, you write down
which reading you used, next to the number.

## ex5 — "Show me the trend, not the total"

`date_trunc` plus `GROUP BY` plus `ORDER BY` — and eleven rows where a
reader expects twelve. Notice also that this query cannot show a month with
*zero* paid orders: `GROUP BY` produces rows only for groups that exist, so
an empty month vanishes rather than appearing as zero. Fixing that needs
`generate_series` and a `LEFT JOIN` (lessons 18 and 09 combined), and it is
one of the most common real reporting requirements there is.

## ex6 — "What were our five best sellers in Q3?"

The full Part 1 stack in one query: three-table join, two filters, group,
aggregate, order, limit — plus the functional-dependency shortcut of
grouping by `p.id` alone and still selecting `p.name` and `p.category`,
which PostgreSQL allows because `p.id` is the primary key.

## review1 — revenue per country

The same shape as ex1 with the grouping key on the other side of a join.
When this comes back, check that you filtered orders and grouped customers,
not the reverse.

Twelve rows, one per country — which means every country had at least one
paid Q3 order. If one had not, it would be missing from the result entirely
rather than showing zero, and a bar chart drawn from this would quietly have
eleven bars. By now that should be a reflex: `GROUP BY` reports the groups
that exist, never the groups that should.

## Further reading

- [Date/Time Functions](https://www.postgresql.org/docs/16/functions-datetime.html) — `date_trunc`, intervals, and the comparison rules that make half-open ranges work. Preview of lesson 18.
- [`generate_series`](https://www.postgresql.org/docs/16/functions-srf.html) — how to produce the periods that `GROUP BY` cannot invent, so an empty month shows as zero.
- [Query Evaluation](https://www.postgresql.org/docs/16/queries-table-expressions.html) — worth one more read now that you have used every clause in it.
- [Use The Index, Luke — Top-N Queries](https://use-the-index-luke.com/sql/partial-results/top-n-queries) — what ex6's `ORDER BY ... LIMIT 5` costs today, and what Part 5 will do about it.
