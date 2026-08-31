## Hint 1
The `THEN` and `ELSE` arms do not have to be literals - any expression
of a compatible type will do.

## Hint 2
Both arms here are numeric, so they unify without a cast. Mixing a
number with a string - `ELSE 'n/a'` - would fail to compile, and that is
the rule worth remembering.
