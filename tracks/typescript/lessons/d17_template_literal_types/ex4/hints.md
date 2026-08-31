## Hint 1

Swap the wildcard from ex3 for a capture. `infer` is legal inside a template
literal pattern, and it binds whatever the placeholder matched.

## Hint 2

The false branch is `S`, not `never` and not `""` - the prompt says a string
without the prefix comes back unchanged, and the gate checks it.

Left to you: what happens if `P` is `""`. Work out the answer before running
it; the placeholder has to match *something*, and "nothing" counts.
