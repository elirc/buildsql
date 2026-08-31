## Hint 1

A recursive `walk(node, depth)` returning a match or `null`. At each level:
the path has run out (so this node must answer the method), or it has not (so
try the static child for this segment, then the param child).

Build the chain and the params on the way back **up**, by prepending this
level's name to whatever the recursive call returned. That way a failed branch
costs you nothing to undo.

## Hint 2

The static child is tried first because it is the more specific route. But
trying it first is not the same as committing to it.

## Hint 3

That is the whole problem: when the static child matches the segment and then
fails deeper down, you must **back out and try the param child**. The obvious
implementation

```ts
const child = node.children?.[segment];
if (child) return walk(child, depth + 1);   // wrong
```

returns `null` for `/orders/new/lines` even though the tree can serve it as
`/orders/:id/lines` with `id = "new"`. The symptom is a route that looks
unregistered, and it only appears when a literal route and a param route
overlap — which is to say, in production.

Take the recursive call's result, check it, and fall through on `null`.

Left for you: what should happen when two levels bind the same param name. The
gate does not ask, and the two defensible answers disagree.
