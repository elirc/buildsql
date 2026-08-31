## Hint 1

Two problems, and they are unrelated to each other. One is arithmetic: a
quantity of zero leaves a line on screen saying `Beans x0`. The other is that
the Add buttons redraw every time anything in the basket moves.

## Hint 2

For the first, notice that "add one", "one more" and "one fewer" are the same
operation with a different number — and that after changing a quantity you can
drop any line that has run out.

## Hint 3

For the second, ask what an Add button actually reads. Only `dispatch` — and
reading a context is a subscription to that context's value, so a value that
bundles the lines with the dispatch subscribes it to the lines. Publish them
separately, and remember that `dispatch` is guaranteed stable, so its context
value never changes at all.
