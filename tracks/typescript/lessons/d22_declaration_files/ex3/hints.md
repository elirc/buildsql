## Hint 1

`declare global { ... }` inside a module reopens the global scope. It is only
legal in a file that is already a module - one with at least one `import` or
`export` - which this file is.

## Hint 2

Use `var`, not `const` or `let`. Only `var` declarations become properties of
`globalThis`, and that is the property you are about to read.

## Hint 3

The declared type includes `undefined`, so the first write has to create the
object. Optional chaining on the read then covers the case where nothing has
been registered yet.

Left to you: whether a module-level `Map` would be better. It would - right up
until two copies of the module are loaded, which is the situation globals exist
for.
