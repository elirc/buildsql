## Hint 1

Two counts and two averages, all over the same scan, so every slice is a `FILTER` and nothing goes in `WHERE`.

## Hint 2

`count(...) / count(*)` is integer division and truncates to 0 before you ever get to `round`. Multiplying by `100.0` first makes the whole expression numeric.
