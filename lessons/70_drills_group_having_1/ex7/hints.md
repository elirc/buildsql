## Hint 1

`ORDER BY` runs after the SELECT list is computed, so it can sort by an aggregate - either by repeating `count(*)` or by using the output alias.

## Hint 2

Without the second sort key the order of tied countries is arbitrary and may differ between runs. Add `country ASC` after the descending count.
