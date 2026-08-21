# Reading - 18_dates_times

Time is the data type that has cost the industry the most money. Not because
the functions are hard, but because almost every intuition about calendars
is wrong somewhere, and the database will faithfully compute the wrong thing
without complaint.

## Notes

**`timestamptz` versus `timestamp`.** `timestamptz` stores an *instant* —
internally UTC — and renders it in the session's time zone. `timestamp`
stores wall-clock digits with no zone attached, which means it does not
identify a moment in time at all. The modern rule: **`timestamptz` unless
you can argue otherwise.** A birthday is a `date`. "9 a.m. local at every
site" is a `time` plus a zone name, resolved at read time. An event that
happened is a `timestamptz`. Storing instants as `timestamp` is the single
most common time-related schema mistake, and it surfaces as a one-hour bug
twice a year.

**`date_trunc` groups; `extract` classifies.** Truncating to month maps
every instant in November 2023 to `2023-11-01 00:00`, so 2022-11 and 2023-11
stay apart. Extracting the month gives `11` for both, folding all Novembers
together. The first is a time series; the second is seasonality. Choosing
wrong flips the meaning of the report while producing a perfectly plausible
chart.

**Weeks start on Monday.** `date_trunc('week', ...)` is ISO 8601, so a
Sunday belongs to the week that began the previous Monday. If your business
defines weeks as Sunday-start, `date_trunc` will silently disagree with
every dashboard you compare it against. The usual fix is arithmetic —
`date_trunc('week', ts + interval '1 day') - interval '1 day'` — and the
usual mistake is not noticing there was a question.

**Half-open ranges, permanently.** `>= start AND < end`. `BETWEEN` on
timestamps is a bug generator: `BETWEEN '2023-10-01' AND '2023-10-31'`
excludes all but the first instant of October 31st, because a bare date
means midnight. Half-open ranges also tile: consecutive periods meet exactly
once, with no gap and no overlap, which is what makes "the sum of the months
equals the year" true.

**`generate_series` manufactures the rows reality did not provide.** A
database stores what happened; a monitoring query needs to know what *did
not*. Generate the calendar, `LEFT JOIN` the facts, and the NULLs are the
answer:

```sql
SELECT gs::date AS day
FROM generate_series('2023-10-15'::date, '2023-11-13'::date,
                     interval '1 day') AS gs;
```

"Which shops reported no sales yesterday", "which sensors went quiet", "which
days had zero signups" are all the same query. The naive alternative —
querying what happened and eyeballing the gaps — cannot be automated, which
is why this pattern is worth more than its two lines suggest.

**Interval arithmetic is not commutative with calendars.** `+ interval '1
month'` on January 31st gives February 28th; adding a month twice is not the
same as adding two months in every case. `+ interval '1 day'` across a DST
boundary adds a calendar day for `timestamptz` and exactly 24 hours for
`timestamp` — a difference of one hour, twice a year, which is precisely the
kind of bug that is dismissed as "rounding" for six months. `age()` gives
you a symbolic interval ("1 year 2 mons"), while subtraction gives an exact
one; they answer different questions.

**Determinism.** No gate in this course calls `now()`, and no seeded row
depends on it. That is deliberate — a test whose expected output changes
with the wall clock is a test that fails on a Monday. When you need "the last
30 days" in production code, pass the reference instant in as a parameter
rather than reading the clock inside the query; it makes the query testable
and lets you re-run last week's report.

## ex1 — orders by weekday

`extract(dow ...)` returns 0 for Sunday through 6 for Saturday — and
`extract(isodow ...)` returns 1 for Monday through 7 for Sunday. Two
functions, two conventions, one off-by-one waiting to happen. The counts
here are flat because the generator does not model weekends; on real data
this is one of the first queries anyone runs.

## ex2 — the days customer 4242 went quiet

Calendar series, `LEFT JOIN`, keep the NULLs. This is the lesson's most
transferable pattern and the one worth being able to write from memory. Note
that it needs three lessons at once: `generate_series` for the expectation,
the outer join for the comparison, and lesson 05's `IS NULL` for the test.

## ex3 — extract classifies, date_trunc groups

The distinction, made concrete on the same column. Worth saying out loud
once: this report has twelve rows and the data covers thirteen months, so
November and December are drawn from a different number of years than the
rest. Seasonality over a non-integer number of years is a comparison nobody
should make without a footnote.

## ex4 — weeks, and where they start

Six weeks in a 31-day month, both ends partial, because ISO weeks start on
Monday. Two lessons in one: know your period boundaries, and know that the
first and last buckets of any period-grouped report are almost always
partial. Chart them unmarked and someone will ask why business collapsed at
the end of every month.

## challenge — peak purchase hours

`extract(hour ...)` classifying three million events. The hour is extracted
in the *session's* time zone, which for a `timestamptz` means the answer
changes if the session zone changes — a genuinely surprising property, and
the reason production reports pin the zone explicitly with `AT TIME ZONE`
rather than trusting whatever the client connected with.

## review1 — orders in the first week after signup

The half-open interval pattern with both bounds computed per row:
`o.created_at >= c.created_at AND o.created_at < c.created_at + interval '7
days'`. The prompt's warning is the real lesson — drop the lower bound and
you count every order the customer ever placed *before* signing up, which
is a nonsensical population that nonetheless produces a confident number
about 26 times too large.

## Further reading

- [Date/Time Functions and Operators](https://www.postgresql.org/docs/16/functions-datetime.html) — `date_trunc`, `extract`, `age`, `AT TIME ZONE`, and the interval arithmetic rules. The `date_trunc` week note is in here.
- [Date/Time Types](https://www.postgresql.org/docs/16/datatype-datetime.html) — the `timestamptz` versus `timestamp` argument, with the storage details that settle it.
- [Set Returning Functions — `generate_series`](https://www.postgresql.org/docs/16/functions-srf.html) — including the timestamp-stepping form used by the gap-days pattern.
- [Don't Do This — timestamp without time zone](https://wiki.postgresql.org/wiki/Don%27t_Do_This) — the short version of the argument, from the PostgreSQL wiki.
