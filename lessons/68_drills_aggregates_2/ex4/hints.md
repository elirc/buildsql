## Hint 1

The difference is the denominator. One average divides by every order; the other divides only by the paid ones, because `avg` ignores NULL inputs and `FILTER` removes rows from that aggregate entirely.

## Hint 2

`CASE WHEN cond THEN total ELSE 0 END` feeds a zero into the average. `CASE WHEN cond THEN total END` - with no ELSE - feeds a NULL, which `avg` skips, making it equivalent to the FILTER form.
