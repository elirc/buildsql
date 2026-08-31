## Hint 1

`Parameters<F>` gives the argument tuple of a function *type*, and
`ReturnType<F>` gives its result. `loadPosting` is a value, so you need `typeof`
to get its type first: `Parameters<typeof loadPosting>`.

Leaving `typeof` out is one of the more confusing errors TypeScript produces.

## Hint 2

`LoadArgs` is a tuple, so the body is a spread: `loadPosting(...args)`.

That is also what makes `callWith(["p1"])` a compile error - the tuple carries
the arity, not just the element types.

Left to you: nothing much, which is the point. Notice that the return type was
never written down anywhere by hand, and that adding a third parameter to
`loadPosting` would update both aliases for free.
