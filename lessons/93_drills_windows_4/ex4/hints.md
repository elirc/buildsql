## Hint 1

Two levels: count customers per country, bucket the twelve resulting rows, then describe the buckets.

## Hint 2

`ntile(5) OVER (ORDER BY customers DESC, country)` over the per-country CTE. When you see the `countries` column, notice which buckets got the two spare rows - `ntile` always front-loads the remainder.
