## Hint 1

An interface may mention itself by name, so
`interface MetaTree { [key: string]: string | MetaTree }` is legal and is the
type you want. Inside the loop, `typeof value === "string"` then narrows the
union to the leaf case and the branch case.

## Hint 2

Carry the path down rather than building objects on the way up. A local helper
`walk(node, prefix)` writes into one accumulator, and the path for a key is
`prefix === "" ? key : prefix + "." + key`.

Only the string case writes anything, which is what makes `{ a: {} }` produce
nothing at all without a special case.

Left to you: a nested arrow function over a shared accumulator, or a helper that
returns a fresh object per level and merges. The first is one allocation.
