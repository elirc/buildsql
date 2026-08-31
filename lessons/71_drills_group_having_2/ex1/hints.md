## Hint 1

`date_trunc('month', ts)` returns a timestamp, not a string: every review in March 2023 maps to 2023-03-01 00:00:00+00, so grouping by it groups by month.

## Hint 2

The same expression goes in the SELECT list and in `GROUP BY` (or `GROUP BY 1`). Do not format it as text first - a text month sorts alphabetically, which puts October before March.
