## Hint 1

The state that decides how many rows to show is already there, and the `map`
ignores it — it walks the whole array. Nothing about memoization helps here,
because the cost is building the rows at all.

## Hint 2

Slice before you map. Then keep the live region honest: it reports how many are
shown out of how many exist, and both halves have to stay true when `Show more`
adds another window.
