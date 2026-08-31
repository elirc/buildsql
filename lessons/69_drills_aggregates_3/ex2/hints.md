## Hint 1

`min` works on dates as happily as on numbers, and needs no cast to answer 'when did this table start'.

## Hint 2

The last column can be written two ways: `count(*) FILTER (WHERE manager_id IS NULL)`, or the difference between `count(*)` and `count(manager_id)`.
