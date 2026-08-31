## Hint 1

One text column assembled from three values plus fixed punctuation. Mind the
spaces and the parentheses - the gate compares the strings literally.

## Hint 2

`format('%s (%s) costs %s', name, category, price)` casts each argument to
text for you; `concat(...)` or the `||` operator work too, but `||` yields
NULL if any operand is NULL.
