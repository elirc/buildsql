## Hint 1

`total` is a question about the whole result set, and the ten rows you are
about to return cannot answer it. It is a second, separate database call -
which is why the budget is two commands and not one.

## Hint 2

`await db.Postings.CountAsync()` translates to `SELECT COUNT(*)`: one row comes
back, not twenty-five. Then the page itself, exactly as in ex1.

`totalPages` is a ceiling division. `total / size` truncates and loses the
short last page; `(total + size - 1) / size` rounds up using only integers.
Check your answer against 25 and 10 before you run the gate.
