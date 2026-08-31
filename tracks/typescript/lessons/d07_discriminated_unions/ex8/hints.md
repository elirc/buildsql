## Hint 1

Five variants, five literals: `"lit"`, `"var"`, `"add"`, `"mul"`, `"neg"`. The
shipped union also collapses `add` and `mul` into one member - they need their
own tags, even though their payloads are identical.

A union member may refer to the union it belongs to, so `left: Expr` is fine.

## Hint 2

Both functions are the same five-branch `switch` with recursive calls; only the
leaves differ.

For a variable, look it up once into a local and compare against `undefined`.
`env[name] ?? 0` is the trap: it hides a missing variable *and* rewrites one
that is legitimately bound to zero, and the gate checks both.

Left to you: whether `render` should track precedence and drop redundant
brackets. It is a genuinely bigger exercise - say what you would need to add.
