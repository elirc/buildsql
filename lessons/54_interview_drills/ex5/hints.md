## Hint 1
The months with zero hires are not in `staff` at all, so no amount of
`GROUP BY` will produce them. You have to invent the twelve rows first and
then attach the data to them.

## Hint 2
`generate_series(DATE '2019-01-01', DATE '2019-12-01', INTERVAL '1 month')`
gives the calendar; `LEFT JOIN` the sales hires onto it on the truncated
month; `count(s.id)` -- not `count(*)` -- so an unmatched month reports 0.

## Hint 3
Two ways to get it wrong. `count(*)` counts the NULL-extended row and prints
1 for the empty months. And a `WHERE s.department = 'sales'` after a LEFT
JOIN deletes those same NULL rows and turns the join back into an inner one
-- the condition has to sit in the `ON` clause, or the aggregation has to
happen before the join.
