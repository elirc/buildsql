## Hint 1

Collect the parameter names into a union first, with a two-branch recursion -
one pattern for a `:name` with more path after it, one for a `:name` at the end
- then map that union into an object. Building the object during the recursion
means intersections.

## Hint 2

`P` has to stay a literal type for any of this to work, which it does because
`defineRoute` is generic over `P extends string` and the argument is a string
literal. Annotating the parameter as plain `string` would end the exercise.

## Hint 3

At runtime the match is segment by segment: same number of segments, `:name`
segments capture, everything else must be equal. The single cast to
`PathParams<P>` at the end is unavoidable - the compiler cannot check that a
`Record<string, string>` built by a loop has exactly the keys the path declared.

Left to you: what a trailing slash should do. `"/users/7/"` splits into four
segments and will not match; whether that is correct is a product decision, and
worth making on purpose.
