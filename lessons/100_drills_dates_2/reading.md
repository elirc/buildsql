# Reading - 100_drills_dates_2

Eight drills on the parts of date handling that only show up in real
reports: epochs, formatting, custom buckets, intervals as numbers, and gap
rules. Read after your attempt, pass or fail.

## Notes

Three ideas carry this set. First, a timestamp is a number underneath -
`extract(epoch FROM ts)` exposes it, and once you have a number you can do
arithmetic that the calendar functions do not offer, which is how any bucket
size is built: divide the epoch by the bucket in seconds, floor it, multiply
back. Second, `to_char` is a presentation layer and should be the last thing
that happens to a value; the one exception is `'YYYY-MM'`, which sorts
identically to the timestamps it came from and is therefore safe as a
grouping key - `'Mon YYYY'` is not. Third, an `interval` is not a number:
comparing two intervals works, but turning one into "months" requires
deciding what a month is, which is precisely why `age()` exists and why
`extract(year ...) * 12 + extract(month ...)` is the standard incantation.
The gap rule in ex8 is the shape of every sessionization job in the
industry, and it is nothing more than `lag()` plus a comparison against an
interval literal.

## ex1 - the timestamp as a number

What this tested: that `extract(epoch FROM ...)` is the bridge between
timestamps and arithmetic. It returns `numeric` in modern PostgreSQL, hence
the cast to `bigint`; APIs and log formats speak in these numbers, so the
conversion has to be reflexive. The classic mistake is assuming the epoch
depends on the session time zone - it does not, because it is measured from
a fixed instant, which is exactly what makes it useful for comparison.

## ex2 - two formats side by side

What this tested: `to_char` patterns, and the padding trap once more.
`HH24` is the 24-hour clock - `HH` is 12-hour and will make midnight and
noon indistinguishable - and `Day` is blank-padded to nine characters unless
you use the `FM` prefix or `trim()`. The model answer builds both columns
from the same timestamp so you can see that formatting never changes the
underlying value, only its rendering.

## ex3 - grouping by a formatted month

What this tested: when a text key is acceptable. `'2023-09' < '2023-10'` as
text agrees with the timestamps' order, so grouping and sorting by the
formatted string is safe and produces a report that needs no post-processing.
The classic mistake is any other format: `'Sep 2023'` sorts April first, and
`'09/2023'` sorts January of every year together. When in doubt, group by
`date_trunc` and format in the outer query, as the reference does.

## ex4 - a bucket `date_trunc` does not offer

What this tested: building your own bucket. `date_trunc` supports minute,
hour, day and friends, but not "every 15 minutes", so you truncate to the
enclosing hour and add back whole quarter-hours: `floor(extract(minute FROM
ts) / 15)` steps of `interval '15 minutes'`. The reference shows the other
standard trick, flooring the epoch to a multiple of 900 seconds and
converting back with `to_timestamp`. The classic mistake is grouping by the
un-floored minute and hoping the report aggregates itself later.

## ex5 - an interval turned into a number

What this tested: that arithmetic on intervals needs a policy. `age()` gives
years, months and days, and "months of tenure" is defined as twelve times
the years plus the months - the leftover days are deliberately discarded,
because that is what "whole months" means. The classic mistake is
`extract(month FROM age(...))` alone, which returns a number from 0 to 11
and makes a four-year veteran look like a new hire.

## ex6 - one week, exactly

What this tested: the half-open range, one more time, on a boundary where
getting it wrong is invisible. Seven days means `>= Monday AND < the
following Monday`; `BETWEEN '2023-03-13' AND '2023-03-19'` looks like the
same week and loses almost all of Sunday. The model answer states the end as
the exclusive bound, and the reference writes it as `start + interval '7
days'` so the length of the period appears in the query text.

## ex7 - how long until the first order

What this tested: an aggregate under an outer join, where the NULLs are the
interesting part. A customer with no orders must survive the join and report
NULL twice - and the subtraction propagates that NULL automatically, so no
special case is needed. The classic mistake is an inner join or a
`coalesce(..., 0)` on `days_to_first`, both of which claim that a customer
who never ordered ordered on the day they signed up.

## ex8 - sessions from a gap rule

What this tested: the sessionization idiom. Take the previous event's
timestamp per customer with `lag()`, compare the gap against an interval
literal, and count the rows that begin a new session - a NULL gap (the
customer's first event) counts as a start too, which is why the predicate
has two branches. The classic mistake is forgetting `PARTITION BY
customer_id`, which measures a gap across the boundary between two
customers' histories and merges their sessions. Note that the session
*count* needs no numbering; assigning session ids would be a running `sum()`
over the same flag.

## Further reading

- [Date/Time Functions and Operators](https://www.postgresql.org/docs/16/functions-datetime.html) - `extract`, `age`, `to_timestamp`, and interval arithmetic.
- [Data Type Formatting Functions](https://www.postgresql.org/docs/16/functions-formatting.html) - every `to_char` pattern, including `HH24`, `FM` and the padding rules.
- [Date/Time Types](https://www.postgresql.org/docs/16/datatype-datetime.html) - what an `interval` stores, and why months and days are kept separately from seconds.
- [Window Functions reference](https://www.postgresql.org/docs/16/functions-window.html) - `lag()`, used here to turn a list of events into a list of gaps.
