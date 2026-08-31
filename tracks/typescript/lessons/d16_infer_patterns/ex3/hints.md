## Hint 1

Tuple patterns can be written out positionally: `[first, ...rest]` works in a
type the same way it works in a destructuring assignment.

## Hint 2

Only one of the two positions needs an `infer` - you are throwing the head
away, so `unknown` is enough to say "there is an element here". Requiring one
element is also what makes the empty tuple fall to the false branch.

Left to you: `readonly [...]` or `[...]` in the pattern. The gate passes a
readonly tuple, so try the mutable form first and read the error.
