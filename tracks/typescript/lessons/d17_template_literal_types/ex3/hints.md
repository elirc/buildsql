## Hint 1

Template literal types work on the right-hand side of `extends` as *patterns*,
not just as constructors. The question becomes: is `S` assignable to the
pattern?

## Hint 2

`${string}` in a pattern means "any characters here, including none" - which is
what makes `StartsWith<"/api", "/api">` come out `true` rather than `false`.

Left to you: why the union case answers `boolean`. Nothing in your definition
mentions unions, and the answer is a rule you drilled in d15.
