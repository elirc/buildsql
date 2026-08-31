## Hint 1

The signature is already written for you here, which makes this one about the
body and about *reading* the signature. `keep` is a function type in parameter
position, so a caller may only pass something that accepts every `string`.

## Hint 2

One loop, one counter, one `if`. The gate checks the predicate is called once
per value, in order, so no caching, no `Set`, no early exit.

Left to you: the loop, or `values.filter(keep).length`. The second is one line
and allocates an array you immediately discard - have a reason for your choice.
