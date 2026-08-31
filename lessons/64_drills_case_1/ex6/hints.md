## Hint 1
The test is `IS NULL`, not `= NULL`. Comparing anything to NULL with `=`
yields unknown, which is never a true branch.

## Hint 2
The `ELSE` arm concatenates a literal with a number, so the number needs
to become text. Watch the trailing space in `'reports to '` - the gate
compares strings exactly.
