## Hint 1

Two `to_char` calls over the same column. One renders the whole timestamp,
the other only the weekday name.

## Hint 2

`'YYYY-MM-DD HH24:MI'` for the stamp - `HH24`, not `HH`, or afternoon looks
like morning. For the name, `'FMDay'` (or `trim()` around `'Day'`) drops the
blank padding.
