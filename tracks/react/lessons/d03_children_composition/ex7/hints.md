## Hint 1
`Switcher` has to look at its children before deciding what to render. Children
are a value - an array-shaped one that may also contain strings, `null` and
`false` - and React ships helpers for walking it safely.

## Hint 2
`Children.toArray(children)` gives you a flat array with the empty slots
already removed; `isValidElement(child)` tells you whether a given entry is an
element at all, which is what makes the `false` and the whitespace harmless.

## Hint 3
An element carries its component in `child.type` and its props in
`child.props`, so "is this a Case for this value" is one comparison of each.
What you render is not the matching element itself - decide what part of it the
user should actually see.
