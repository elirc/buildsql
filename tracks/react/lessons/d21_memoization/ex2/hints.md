## Hint 1

Same shape as exercise 1, different kind of value. Two of the filter's three
props are genuinely unchanged between renders; the third is written as an arrow
function inside the JSX, and an arrow function written in a render is a new
object each time that render runs.

## Hint 2

`useCallback(fn, deps)` hands back the same function until a dependency
changes. Write the toggle so it never needs to read the current count — the
updater form of the setter — and the dependency list is empty.
