## Hint 1

A `namespace` declared with the same name as a function *merges* with it: the
namespace's exports become properties of the function object, at runtime and in
the type.

## Hint 2

Order matters. The function declaration has to come first, or the compiler
cannot tell which of the two is the value being extended.

`export namespace parseTag { ... }` next to `export function parseTag(...)` is
the whole mechanism - no `Object.assign`, no interface describing the callable.

Left to you: whether `VERSION` should be annotated `string` or left to infer
`"1.0"`. The gate wants `string`; note which of the two an ordinary `const`
gives you.
