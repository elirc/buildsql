## Hint 1

A schema cannot mention itself while it is being defined — the constant does not
exist yet. `z.lazy(() => ...)` wraps the definition in a function that is not
called until something is parsed, by which time it does.

TypeScript needs help too: give the constant an explicit
`z.ZodType<Category>` annotation, because it cannot infer the type of a value
defined in terms of itself.

## Hint 2

The depth rule does not belong on the node. A node has no idea how far down the
tree it sits, so no amount of `.refine()` on the node schema can express
"at most three levels" — the rule belongs to the *tree*, which means one
`superRefine` on the outside, walking from the root with a depth counter.

## Hint 3

The point of the walk is the `path` you build as you descend. Every time you
step into a child, push `"children"` and the index; when you find a node that is
too deep, the accumulated path is exactly where it lives, and adding `"name"`
points at something the client can highlight.

`ctx.addIssue` takes that array as-is; the bracket rendering happens later, in
the handler. And note that `superRefine` runs even when the fields underneath it
already failed, so guard the walk against a shape you were not given — or accept
that a tree with a bad name *and* a bad depth reports both.
