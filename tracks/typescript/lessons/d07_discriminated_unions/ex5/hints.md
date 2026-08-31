## Hint 1

Pin `"click"`, `"key"` and `"scroll"`. Narrowing works the same inside a `map`
callback as anywhere else - the callback parameter is the union, and the
`switch` refines it.

## Hint 2

The button is typed `0 | 1 | 2`, so a three-element lookup table indexed by it is
total - no fallback branch is needed, and the compiler knows the result is one
of the three names.

Scroll needs two questions rather than one: zero first (it is neither direction),
then the sign. The distance reported is never negative.

Left to you: a `switch` inside `map`, or three small helpers. If the set of
events grows past five, one of those stays readable.
