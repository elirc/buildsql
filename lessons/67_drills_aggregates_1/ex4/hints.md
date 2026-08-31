## Hint 1

`min` and `max` are not numeric-only: they work on any orderable type, timestamps included, and they are the cheapest way to ask what period a table covers.

## Hint 2

Subtracting one `date` from another gives an integer number of days. Subtracting two timestamps would give you an `interval` instead, which is a different type and a different answer.
