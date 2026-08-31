## Hint 1

A property whose value is computed when it is read is a **getter**. Object
literals can declare one, but you need a getter per dynamic name, so the tool
is `Object.defineProperty` (or `Object.defineProperties`) inside a loop over
`Object.entries(factories)`.

## Hint 2

Two details decide whether this passes.

`Object.defineProperty` defaults `enumerable` to `false`, which would make
`Object.keys()` return an empty array — the gate checks the keys *before*
anything is built, so say `enumerable: true` explicitly.

And each getter needs its own memo, exactly like ex1: a `built` flag plus a
value, captured per property by the loop body. The `let` inside the loop is
what gives each property its own pair; hoisting them above the loop would give
every member one shared cell.
