## Hint 1

Two topics: type predicates (d18) and a constrained second type parameter (d10).
`S extends T` is what lets the return type be narrower than the element type.

## Hint 2

`Array.prototype.find` has a predicate overload that would do this - and
returning early from a loop makes the "stops at the first match" requirement
visible, which the gate counts.

Left to you: `find` with the guard, or the explicit loop. Both narrow correctly;
only one of them shows the reader why the answer is `S` and not `T`.
