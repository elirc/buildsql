## Hint 1

`nullif(denominator, 0)` turns a zero divisor into NULL, and dividing by NULL gives NULL instead of an error. This is the standard guard for any rate or ratio.

## Hint 2

Both counts can be written with `FILTER (WHERE ...)`. Cast the numerator to numeric before dividing, or integer division will truncate the answer to whole numbers.
