## Hint 1

Same pattern as ex1, now in `WHERE` and anchored at both ends so the whole
address has to match, not just its beginning.

## Hint 2

`^user[0-9]{2}@example\.com$`. The backslash makes the dot a literal dot -
without it the pattern also accepts `example!com`. A bracketed `[.]` says
the same thing without the escape.
