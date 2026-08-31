## Hint 1

Trim the union to the two members the importer really has. Then notice the
problem `idKey` exists to solve: `String(12)` and `String("12")` are the same
text, so a key built from the value alone cannot tell the two ids apart.

## Hint 2

Put the member into the key. A one-character tag is enough - `n:` for the
number branch and `s:` for the string branch - and `typeof id === "number"`
chooses between them.

`sameId` is then one comparison of two keys, with no narrowing of its own.

Left to you: whether `sameId` should compare keys or narrow both arguments
itself. The key version has one rule in one place; say why that matters when a
third member arrives.
