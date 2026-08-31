## Hint 1
Nothing here is state - every number on screen is a function of the three props,
computed during render. Start with the empty case, which is a different sentence
altogether and deserves an early return.

## Hint 2
The lower bound is straightforward. The upper bound is whichever is smaller:
the end of this page, or the end of the data. `Math.min` says that in one line
and is easier to read than a ternary.
