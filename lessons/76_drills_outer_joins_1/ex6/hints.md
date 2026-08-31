## Hint 1
This one asks you to print the bug next to the fix. Both columns come out of the same grouped LEFT JOIN; they differ only in what you count.

## Hint 2
`count(*)` counts rows in the group, and a NULL-extended row is still a row - so a customer with no qualifying order gets 1. `count(o.id)` counts non-NULL values of that column, so the same customer gets 0. Put the `total > 1900` restriction in the `ON` clause or the unmatched customers vanish before you can count them.
