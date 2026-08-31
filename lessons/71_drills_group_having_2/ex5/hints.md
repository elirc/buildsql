## Hint 1

`CASE` evaluates its branches in order and stops at the first match, so `WHEN rating <= 2` first, then `WHEN rating = 3`, then `ELSE`.

## Hint 2

The denominator cannot be an aggregate of the current query - `count(*)` there means the group. A scalar subquery `(SELECT count(*) FROM reviews)` is evaluated once and used by every group.
