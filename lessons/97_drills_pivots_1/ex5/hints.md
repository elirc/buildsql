## Hint 1

Two counts over the same group - one restricted, one not - and then a ratio
built from both. Aggregates may be combined with arithmetic freely.

## Hint 2

You cannot write `round(100.0 * dear / products, 1)`: output aliases are not
in scope inside the SELECT list that defines them. Repeat both aggregates in
the ratio, and keep the `100.0` so the division is not integer division.
