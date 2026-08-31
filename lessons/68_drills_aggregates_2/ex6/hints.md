## Hint 1

`DISTINCT` and `FILTER` can appear on the same aggregate call: `count(DISTINCT col) FILTER (WHERE ...)`. The DISTINCT goes inside the parentheses, the FILTER after them.

## Hint 2

You can count distinct values of an expression, not just of a column - `count(DISTINCT date_trunc('month', created_at))` is how you ask how many months the table spans.
