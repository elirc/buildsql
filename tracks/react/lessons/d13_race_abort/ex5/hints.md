## Hint 1

Nothing changed between the two clicks — same account, same props — so no
effect re-ran and no cleanup fired. The flag trick has nothing to hang on
here. What distinguishes the two requests is only the order they were made in.

## Hint 2

Give each request a number and keep the newest number somewhere that survives
renders without causing them. A callback then compares the number it was born
with against the newest one, and stays quiet unless they match. Mount and
Refresh should go through the same code, so both share the counter.

## Hint 3

Careful with the last check: after a stale answer arrives, the next refresh
must still be able to win. That works if the number is compared, and breaks if
you set a boolean like `ignoreLate` and never clear it.
