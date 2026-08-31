## Hint 1

`key: keyof T` is the fix that turns a typo in a sort specification into a
compile error - and the return type is `T[]`, not `unknown[]`.

Sort a **copy**: `sort` mutates the array it is called on.

## Hint 2

`a[key] < b[key]` will not compile for a generic value type, and casting both
sides to make it compile is how `120` ends up sorting before `90`.

Write one small helper that takes two `unknown`s: equal values return `0`, two
numbers subtract, everything else compares as text. The comparator then walks
the sort keys and returns as soon as one of them decides.

`Array.prototype.sort` has been stable since ES2019, which is what keeps rows
that tie on every key in their input order.

Left to you: how `null` and `undefined` should sort. The helper above puts them
wherever `String()` does - decide whether that is good enough to ship.
