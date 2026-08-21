## Hint 1

Try writing the body first. `a.length` does not compile, because `T` could be
anything - a number, a boolean, `null`. The fix is not a cast; it is telling
the compiler what `T` is allowed to be.

## Hint 2

A constraint is written with `extends` in the type parameter list:

```ts
function biggest<T extends { size: number }>(a: T, b: T): T { ... }
```

Inside the function, `T` now has everything the constraint promises. At the
call site, an argument without that member is rejected - which is what the
type gate's `longest(1, 2)` probe is checking.

Strings and arrays both have `length`, so one constraint covers both.

## Hint 3

Constrain `T extends { length: number }`, then return whichever of the two has
the greater `length`.

The decision left to you is the tie: two arguments of equal length. The README
says which one comes back, and the gate checks it - pick the comparison
operator that gets you there without an extra branch.
