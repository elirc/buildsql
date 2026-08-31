# Reading - 107_drills_distinct_on_1

Eight drills on one-row-per-group picks. Read after your attempt, pass or
fail.

## Notes

`DISTINCT ON` is a selection rule wearing an `ORDER BY`'s clothes: the sort
must lead with the group expression, and everything after that decides which
row of each group survives. That gives the construct exactly three failure
modes, and this set walks into all of them on purpose. Forget the leading
match and PostgreSQL refuses the query outright (the friendly failure).
Forget the tie-break and the query runs, returns plausible rows, and returns
*different* plausible rows after the next VACUUM (the dangerous failure).
Want the output presented in an order that is not the group key, and you
must wrap the pick in a subquery and sort outside (the workaround, drilled
in ex7). Every problem here also has a `row_number() = 1` spelling - the
references use it throughout - which is portable SQL and the form to reach
for the moment a colleague on MySQL has to read your query.

## ex1

The lesson-49 pattern verbatim on a new axis, pointed backwards: `ASC`
picks each status's oldest order. What it tested: the leading `ORDER BY`
rule and a deliberate tie-break, because half a million orders at
one-second granularity make same-second collisions inside a status a
certainty. The classic mistake is `ORDER BY created_at` alone - a syntax
error here, since the sort must start with `status`. The model answer
reads: group by status, oldest first, lower id settles dead heats.

## ex2

A pre-filter changes what "latest" means. The status condition must run
before the pick - `WHERE` does exactly that - so the survivor is each
customer's latest order *among the non-cancelled ones*. The classic mistake
is picking first and filtering after (an outer query's WHERE): that erases
customers whose most recent order was cancelled instead of falling back to
their previous one, which is a different report with quieter numbers. Where
a filter sits relative to a pick is a correctness decision, not style.

## ex3

Scale test with training wheels: `events.ts` is unique by construction, so
the tie-break can be skipped without harm - once you can say *why*. What it
was really testing is whether you know when determinism comes for free. The
classic mistake is assuming that property holds for every timestamp column;
`orders.created_at` and `customers.created_at` both collide. The model
answer sorts `event_type, ts DESC` and would add `, id DESC` on any column
without a uniqueness guarantee.

## ex4

`DISTINCT ON` over an expression. The parser wants the leading `ORDER BY`
item to match the `DISTINCT ON` expression, so `attributes ->> 'size'`
appears twice, verbatim. The classic mistake is writing the alias (`ORDER
BY size, ...` works, but only because PostgreSQL resolves the alias to the
same expression - rely on the verbatim form when in doubt). What it tested:
that the group key can be computed - a JSONB extraction, a `date_trunc`, an
arithmetic bucket - without changing the construct at all.

## ex5

Same idea pointed backwards in time: `ASC` instead of `DESC` flips "latest
per group" into "first per group", and nothing else moves. What it tested:
the selection rule lives entirely in the sort direction, plus a computed
group key (`date_trunc`). The classic mistake is an off-by-one on the year
filter - a closed `<= '2023-12-31'` drops nothing here but is the wrong
habit; the half-open `>= 2023-01-01 AND < 2024-01-01` form from lesson 18
is the one that survives timestamps.

## ex6

Composition with a self-join. The pick runs over the joined row set, so
`DISTINCT ON (s.manager_id)` sees reports already paired with their
manager's name - one construct, no second pass. What it tested: qualifying
every column once two copies of `staff` are in play, and realising the CEO
needs no special handling (a NULL `manager_id` never joins, so the row
never exists to be picked from). The classic mistake is grouping by the
manager's *name* - two managers can share one.

## ex7

The presentation-order conflict, which is the single most common real-world
stumble with this construct. The pick needs `ORDER BY month, revenue DESC,
country`; the stakeholder wants `revenue DESC, month`. One query cannot
serve both masters, so the pick becomes a subquery and the outer query
sorts the eleven survivors. The classic mistake is trying to bolt the
presentation sort onto the `DISTINCT ON` query and fighting the parser. The
model reasoning: aggregate, pick, present - three stages, each with its own
ordering needs, only the last one visible to the reader.

## ex8

Keeping the empty groups. `DISTINCT ON` alone answers "last event per
customer *who has events*"; the prompt demands all ten customers, so the
pick is built first and a `LEFT JOIN` attaches it - lesson 09's
join-then-keep logic wrapped around lesson 49's pick. The classic mistake
is `LEFT JOIN events` followed by `DISTINCT ON` with the customer filter in
the wrong place, or any filter on the events side in the outer `WHERE`,
which silently turns the join inner. The reference shows the third
spelling, `LEFT JOIN LATERAL ... LIMIT 1`, and choosing between the three
by index availability is a Part 5 conversation.

## Further reading

- [SELECT - DISTINCT Clause](https://www.postgresql.org/docs/16/sql-select.html#SQL-DISTINCT) - the formal rules for DISTINCT ON and its ORDER BY interaction.
- [Table Expressions - LATERAL Subqueries](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-LATERAL) - the equivalent per-row-lookup spelling used in ex8's reference.
- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) - row_number(), the portable one-row-per-group idiom every reference here uses.
- [PostgreSQL Wiki - Don't do this](https://wiki.postgresql.org/wiki/Don%27t_Do_This) - a catalogue of adjacent footguns, including ambiguous picks that "work" until they don't.
