## Hint 1

A recursive helper over the cause chain, building a plain object. `name` and
`message` go in unconditionally; the other three are conditional.

Build the object with the two required keys and then **assign** the optional
ones inside `if`s. Writing `{ name, message, code: error.code }` in one literal
gives you a `code: undefined` key, and the gate checks `Object.keys`.

## Hint 2

Type-check the optional fields rather than truth-checking them. `code` is
meaningful only when it is a string; `status` only when it is a number. Both are
`unknown` as far as the type system is concerned, because anybody can attach
anything to an error.

The stack is not on the list, deliberately: it is enormous, it does not
round-trip through JSON well, and it leaks absolute paths from your build
machine into whatever you send this to.

## Hint 3

The loop guard is the same `Set` as d10's `explain`, and it matters more here.
Serialising is often the last thing a dying process does — a hang at that point
loses the entire report, which is the one thing you needed.

The remaining decision: when the walk stops at an already-seen cause, this
version simply omits it. The alternative is a marker like
`{ name: "Circular", message: "..." }`. One of those is easier for a reader to
interpret; pick deliberately.
