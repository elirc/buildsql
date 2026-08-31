## Hint 1

`HAVING` may reference any aggregate of the group, whether or not that aggregate is selected. Nothing forces the two lists to match.

## Hint 2

'At least one row above the threshold' can be written as `max(price) > 499.5`, or as a count of the matching rows being greater than zero.
