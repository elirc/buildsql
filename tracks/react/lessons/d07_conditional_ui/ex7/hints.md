## Hint 1
Two independent questions with different answers: what the button is called,
and what is drawn inside it. Work them out as two values above the return and
the JSX stops fighting you.

## Hint 2
Snoozed wins over everything - check it first, in both values. After that the
name has three forms (none, one, many) and the badge has two (the number, or
the cap).

## Hint 3
Watch the badge condition: it has to produce nothing at all for zero and for
snoozed, so a bare `&&` on a number will bite you the same way ex2 did. Decide
what "nothing" is represented by in your badge value, and check for that
exactly.
