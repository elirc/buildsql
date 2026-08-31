## Hint 1

Write the return type as an object with three named `string[]` members. A
`Record<string, string[]>` would let a typo invent a fourth list.

Two passes, not one: `after` finds what was added and what changed, `before`
finds what was removed. A single pass always misses one of the three.

## Hint 2

Use `key in object` rather than `object[key] !== undefined` for the presence
question - an index signature claims every key exists, so the second test lies
about a key whose value really is `undefined`.

The comparison for *changed* is `!==`, which is what makes `1` and `"1"` a
change rather than a match.

Left to you: sort each list at the end, or keep the keys sorted as you go. The
gate only checks the output, but one of those is obviously cheaper to explain.
