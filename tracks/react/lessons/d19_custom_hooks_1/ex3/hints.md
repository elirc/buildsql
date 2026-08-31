## Hint 1

The number lives at module scope, which means there is exactly one of it for
the whole file — and the `useState` in the hook is only there to force a
re-render, not to hold anything. Two components using this hook are looking at
the same number.

## Hint 2

A custom hook is not a place where state lives; it is a recipe for calling
`useState`, and each component that follows the recipe gets its own slot. Move
the count into the state you already have and delete the module-level variable.
