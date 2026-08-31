## Hint 1

The accumulator has to be typed `unknown` and re-checked on every iteration.
Checking the container once before the loop is not enough - each step lands on
a new value of unknown shape.

## Hint 2

Two checks per step: is the current value an object that is not `null`, and
does it have this key as an own property? Only then may you index into it, and
that index needs one cast to `Record<string, unknown>`.

Arrays are objects, so `"1"` works as a key with no special case.

Left to you: `undefined` for "not found" means a stored `undefined` and a
missing key look the same. The prompt accepts that; note what it would take not
to.
