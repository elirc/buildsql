## Hint 1
Distinct *pairs*, not distinct products and separately distinct ratings.
One `DISTINCT` covering both columns does that.

## Hint 2
The output is far larger than ex4's and far smaller than the reviews
table. If you get one row per review, an extra column is in your SELECT
list; if you get five, you selected only `rating`.
