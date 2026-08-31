# Reading - 99_drills_dates_1

Eight drills on the four operations that make up all date handling:
truncate, extract, subtract, and bound a range. Read after your attempt,
pass or fail.

## Notes

`date_trunc` and `extract` look similar and are opposites. `date_trunc`
keeps the type - a timestamp goes in, a timestamp comes out, snapped down to
the start of the bucket - which is why it can be sorted, compared and
grouped and still mean an instant in time. `extract` throws the type away
and returns a bare number, so `extract(month FROM created_at) = 6` folds
every June of every year together, which is sometimes what you want and is
usually a bug in a trend report. Subtraction is a third thing again:
`date - date` is an integer count of days, `timestamp - timestamp` is an
`interval`, and `age(a, b)` is an interval measured in calendar units rather
than elapsed time, so it knows that a month can be 28 or 31 days. And the
range convention is not pedantry: `created_at < DATE '2023-07-01'` includes
every instant of June 30th including 23:59:59.999, while `BETWEEN` with an
end date of June 30th stops at midnight and quietly drops a day of data.

## ex1 - three views of one timestamp

What this tested: that a timestamp has a type and casting changes it. The
cast to `date` discards the time of day and gives you a `date` value;
`date_trunc('hour', ...)` keeps a full timestamp and merely zeroes the
smaller fields. The classic mistake is treating them as interchangeable -
they group identically but they do not display, sort against a timestamp, or
subtract identically. The model answer shows both beside the original so the
difference is visible in one glance.

## ex2 - a month label

What this tested: `to_char`, the formatter, as distinct from `date_trunc`,
the bucketer. Both answer "which month", but one returns text you can print
and the other returns a timestamp you can compute with. The classic mistake
is grouping a report by the `to_char` string: `'2023-09'` sorts fine, but
`'Sep 2023'` sorts alphabetically and puts April first. Format at the end,
group on the real thing.

## ex3 - the quarterly numbers

What this tested: that `date_trunc` takes any bucket name, quarter included,
and that the grouping key can be the truncated timestamp itself. Five rows
is right for a year of data that starts in mid-November: the first and last
quarters are partial. The classic mistake is `extract(quarter FROM ...)`,
which returns 1 to 4 and merges the 2022 and 2023 fourth quarters into one
misleading row.

## ex4 - a month, day by day, with weekday names

What this tested: a half-open month range, plus the padding trap in
`to_char`. The `Day` pattern is blank-padded to nine characters, so
`'Monday   '` is not `'Monday'` and a comparison against the short string
fails silently; `trim()` or the `FM` prefix removes it. The classic mistake
is `BETWEEN '2023-06-01' AND '2023-06-30'`, which loses everything after
midnight on the 30th - about one day in thirty of the data.

## ex5 - tenure in days and years

What this tested: date subtraction and integer division. `DATE '2023-11-14'
- hired_on` is an `int`, so dividing by `365` would floor the result to
whole years; dividing by `365.0` promotes the expression to `numeric` and
keeps the fraction, which is why the prompt spells out the constant. The
classic mistake is `now() - hired_on`, which gives a different answer every
day and cannot be tested; the model answer anchors on a fixed date.

## ex6 - the same span as an interval

What this tested: `age()` against plain subtraction. `age()` walks the
calendar - "4 years 2 mons 11 days" - while subtraction counts elapsed days,
and the two disagree about February in a way that matters for anniversaries
and contract terms. The classic mistake is `extract(year FROM ...)` on the
*date* rather than on the interval, which returns the hire year instead of
the tenure. The model answer extracts from `age(...)`, and casts to `int`
because `extract` returns `numeric`.

## ex7 - how long has this customer been with us

What this tested: aggregates that produce dates, and a `HAVING` clause over
a derived quantity. `min()` and `max()` work on timestamps exactly as they
do on numbers, and the span is the difference of the two casts. The classic
mistake is putting the 300-day condition in `WHERE`, where the aggregates do
not yet exist; the reference sidesteps the repetition by computing the
aggregates in a CTE and filtering with an ordinary `WHERE` outside it.

## ex8 - the 30-day follow-up

What this tested: a range condition inside a join - the pattern behind
"repeat purchase within 30 days", "second incident within a quarter", and
every cohort follow-up metric. The interval arithmetic happens per row:
`o.created_at + interval '30 days'` is a moving bound, not a constant. The
classic mistake is an inner join, which drops the orders that had no
follow-up instead of reporting a zero for them; a `LEFT JOIN` with
`count(o2.id)` keeps them, as does the reference's correlated subquery.

## Further reading

- [Date/Time Functions and Operators](https://www.postgresql.org/docs/16/functions-datetime.html) - `date_trunc`, `extract`, `age`, and the arithmetic table showing which combination yields what type.
- [Date/Time Types](https://www.postgresql.org/docs/16/datatype-datetime.html) - `date`, `timestamp`, `timestamptz` and `interval`, and how literals are parsed.
- [Data Type Formatting Functions](https://www.postgresql.org/docs/16/functions-formatting.html) - `to_char` patterns, including the `FM` prefix that suppresses padding.
- [`BETWEEN` and range predicates](https://www.postgresql.org/docs/16/functions-comparison.html) - why an inclusive upper bound is the wrong tool for a timestamp.
