## Hint 1

"The two highest price points" is about distinct values, not rows - the numbering function that gives equal values the same number *without gaps* is `dense_rank()`.

## Hint 2

`dense_rank() OVER (PARTITION BY category ORDER BY price DESC)` and keep `dr <= 2`. No tie-break in the window - equal prices are supposed to share a rank here. If two products share a category's top price, both appear and the count exceeds twelve; that is the point.
