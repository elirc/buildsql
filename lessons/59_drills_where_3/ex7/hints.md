## Hint 1
Two patterns joined by `OR`, then a numeric test joined by `AND`. That
combination always needs brackets.

## Hint 2
Without them, `AND` binds tighter and you get `Router-anything` at any
price plus expensive tablets - a superset that looks plausible until you
count it.

## Hint 3
A regular expression can express the two alternatives in one predicate:
the `~` operator matches a POSIX regex, and `(A|B)` means "either". Getting
the bracketed `LIKE` version working first is still the better route -
reach for the regex only once you can see the two are the same set.
