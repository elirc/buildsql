## Hint 1

Two declaration fixes before any logic: add `implements Ledger` to the class,
and give `standings()` the return type the interface asks for. With
`implements` in place the compiler will name every remaining mismatch for you.

## Hint 2

A `Map<string, number>` is the natural store, and one private helper
(`add(player, amount)`) keeps the `?? 0` default in exactly one place.

`record` adds `points` to white and `1 - points` to black. `standings()` turns
the entries into objects and sorts on two keys: points descending, then name
ascending when the points are equal.

Left to you: a `Map` or a plain object. The `Map` avoids inherited-key
surprises for a player called `constructor`; say whether that matters to you.
