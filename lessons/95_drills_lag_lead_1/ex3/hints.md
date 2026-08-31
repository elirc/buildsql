## Hint 1

LAG takes an optional second argument: how many rows back to look. One row back is yesterday; the same weekday last week is seven rows back.

## Hint 2

`lag(revenue, 7) OVER (ORDER BY day)` on a CTE of daily shipped revenue. The first seven days have no row seven back, so `week_ago` is NULL for them - that is correct, not a bug to patch.
