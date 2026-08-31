## Hint 1

Two counters in a closure and one early return. The returned function is
callable *and* has methods, so build the arrow function first, assert it to the
interface type, then attach `calls` and `suppressed` to it.

## Hint 2

Increment the "real call" counter **before** invoking the callback, not after. A
callback that calls itself — directly or through the API it drives — would
otherwise find the guard still open and run twice, which is the exact bug the
guard exists to prevent.

Counting the suppressed calls rather than throwing is a deliberate choice worth
being able to defend: this wrapper usually sits between you and somebody else's
library, and a nonzero count is a diagnostic you can log without turning their
bug into your crash.
