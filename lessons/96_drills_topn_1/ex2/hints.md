## Hint 1

"The newest row per group" is the ranked-CTE idiom from lesson 15: number the rows inside each country, newest first, then keep number one.

## Hint 2

`row_number() OVER (PARTITION BY country ORDER BY created_at DESC, id DESC)` in a CTE, `WHERE rn = 1` outside. The whole row - id, name, timestamp - rides along for free, which is precisely what makes this beat `max(created_at)` + a join back.
