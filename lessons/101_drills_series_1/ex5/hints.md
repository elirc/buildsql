## Hint 1

This is an anti-join against a generated spine: keep the weeks for which the
data has nothing to say.

## Hint 2

`NOT EXISTS (SELECT 1 FROM staff s WHERE s.hired_on >= w.week_start AND
s.hired_on < w.week_start + 7)`, or the `LEFT JOIN ... WHERE s.id IS NULL`
spelling of the same idea.

## Hint 3

Keep the window half-open. `BETWEEN week_start AND week_start + 7` covers
eight days and lets one Monday hire knock out two weeks. Adding an integer
to a `date` adds days, so `w.week_start + 7` is the following Monday.
