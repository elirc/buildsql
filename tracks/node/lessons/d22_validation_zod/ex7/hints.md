## Hint 1

`error.issues` is already a flat list — one entry per failure, however deep in
the object it happened. There is no tree to walk. The whole exercise is
rendering `issue.path`, which is an array of strings *and numbers*.

## Hint 2

A `fold` over the path, with one rule per kind of segment:

- a **number** is an array index: append `[n]` with nothing in between;
- a **string** is a key: append `.name`, except at the very start where there is
  nothing to put a dot after.

`path.join(".")` is the version everybody writes first, and it produces
`items.0.qty` — which no client can map back to a form field, and which quietly
becomes ambiguous the moment an object has a key called `0`.

## Hint 3

Two decisions the gate pins down and one it leaves you.

An empty path is a real case: object-level rules and `unrecognized_keys` both
report with no path at all. An empty string in the payload is not an answer, so
give it a name.

Do not sort. Zod emits issues in schema order with the object-level ones last,
which is stable across runs — sorting by path would scramble a form's field
order for no gain.

Left to you: whether to flatten an `invalid_union`'s `unionErrors` into the
list. The branches contradict each other by construction — "expected string"
*and* "expected number" for the same field — so think about what a client would
do with both before you decide.
