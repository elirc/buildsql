# Reading - 106_drills_lateral_1

Eight drills on per-row subqueries. Read after your attempt, pass or fail.

## Notes

Every problem in this set is the same sentence with different nouns: *for
each X, the top N Y by Z*. Once you hear that sentence, the query writes
itself - a driving set on the left, a `LATERAL` subquery on the right that
filters to the current driving row, sorts by Z with a tie-break, and stops
at `LIMIT N`. The two decisions that remain are the join flavour (`CROSS
JOIN LATERAL` drops driving rows with no matches, `LEFT JOIN LATERAL ... ON
true` keeps them) and the tie-break, which is not optional: a top-N whose
sort key can repeat is nondeterministic without one. The window-function
formulation (`row_number() ... WHERE rn <= N`) always works too and is what
the references here mostly use - it ranks everything and then discards,
where the lateral stops early per group. Same rows, different work.

## ex1

Direct application of the lesson-48 pattern with a derived driving set.
What it tested: building the left side with `SELECT DISTINCT department`
rather than hard-coding five names, and remembering the tie-break on
`hired_on`. The classic mistake is `ORDER BY hired_on` alone inside the
lateral - two same-day hires make "the three newest" ambiguous and the gate
notices. The model answer sorts `hired_on DESC, id ASC` inside and repeats
the full ordering outside.

## ex2

The LIMIT 1 lookup, and a semantics question disguised as syntax: should a
customer with no orders appear? The prompt says no, and `CROSS JOIN
LATERAL` encodes exactly that - it behaves like an inner join. The classic
mistake is not thinking about the question at all, which happens to pass
here and then silently loses rows in the next report where it should not.
The reference solves it with `DISTINCT ON (customer_id) ... ORDER BY
customer_id, total DESC, id` - lesson 49's shortcut for the same shape.

## ex3

Ex2's mirror image: the empty lookup must survive. What it tested: `LEFT
JOIN LATERAL (...) ON true`, including the slightly odd mandatory `ON
true`. The classic mistake is writing `CROSS JOIN LATERAL` and losing any
reviewless product, or filtering on a review column in the outer WHERE,
which turns the outer join back into an inner one - lesson 09's oldest
trap, resurfacing here. The model reasoning: requirements about *keeping*
rows always decide the join type before anything else is written.

## ex4

Pick-then-aggregate. The trap is that `sum()` and `LIMIT` in one query
level run in the wrong order - aggregates happen before the limit, so a
one-level query sums the whole department and then "limits" a single row.
The nesting inside the lateral (inner query picks three rows, outer sums
them) is what sequences the steps. The classic mistake is exactly that
one-level version; it returns each department's full payroll and fails
loudly. Same lesson as 48's challenge, drilled on a different aggregate.

## ex5

A repeat of the pattern with the driving set built from the fact table
itself (`SELECT DISTINCT rating`). The point being tested is small but
real: a million reviews at one-second timestamp granularity collide
constantly, so the `id` tie-break is what makes "the three freshest" a
fixed set. The classic mistake is assuming a timestamp column will not
tie; only `events.ts` in this dataset carries that guarantee, and knowing
which columns do is part of knowing the data.

## ex6

The efficiency argument made concrete. Per customer, the lateral reads a
handful of events and stops; the window version scans and ranks every event
of every driving customer before throwing almost all of it away. On a
3,000,000-row stream that difference is the reason this pattern exists (and
in Part 5 an index on `(customer_id, ts)` turns each lateral probe into a
few index reads). What it tested: nothing new - recognising that the same
five-line shape scales from `staff` to `events` unchanged.

## ex7

The lateral subquery as a full report: join, filter, group, sort, limit,
all per driving row. What it tested: composing a three-table aggregate
inside the lateral without losing the correlation (`p.category =
c.category`). The classic mistake is putting the category correlation in
the outer query's WHERE - it is out of scope there - or grouping outside
the lateral, which computes a global top three instead of three per
category. The reference is the honest window version; both must agree row
for row, which is worth verifying by eye once.

## ex8

Two stacked patterns: an aggregate-sort-limit CTE builds the driving set
(the five whales), then a per-row lookup fetches each whale's latest
non-cancelled order. What it tested: consistency of the business rule
across both halves - the status filter has to appear in the revenue
aggregate *and* in the lateral, or a cancelled order can surface as
somebody's "last order" while contributing nothing to their revenue. That
is the kind of quiet contradiction stakeholders find months later. The
reference computes the same thing with `DISTINCT ON` joined to the top-five
CTE.

## Further reading

- [Table Expressions - LATERAL Subqueries](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-LATERAL) - the formal scoping rules for what a lateral item may reference.
- [SELECT](https://www.postgresql.org/docs/16/sql-select.html) - the LATERAL clause in the reference grammar, and LIMIT interaction with ORDER BY.
- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - the rank-then-filter alternative every exercise here could be rewritten with.
- [PostgreSQL Wiki - Loose indexscan](https://wiki.postgresql.org/wiki/Loose_indexscan) - the skip-scan family of tricks for per-group firsts, and why indexes make lateral probes cheap.
