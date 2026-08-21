## Hint 1

A recursive shape and a flat output, in *depth-first, pre-order* - a node
appears before its children, and a subtree is finished before the next sibling
starts. Say that ordering back to the interviewer before you start; half the
wrong answers are breadth-first by accident.

The `children` property is optional, which is the only fiddly part.

## Hint 2

An inner helper carrying the depth is the readable shape:

```ts
const walk = (nodes: readonly TreeNode[], depth: number): void => {
  for (const node of nodes) {
    // record, then recurse into node.children with depth + 1
  }
};
```

`node.children ?? []` turns the optional array into "nothing to recurse into",
which removes the `if` entirely.

## Hint 3

Declare a `FlatNode[]` accumulator, define `walk(nodes, depth)` that pushes
`{ id: node.id, depth }` and then calls itself with the children and
`depth + 1`, call it with the roots at depth `0`, and return the accumulator.

Left to you: what happens with a tree ten thousand levels deep. Recursion blows
the stack; an explicit stack of `[node, depth]` pairs does not - and knowing
that trade-off is often the follow-up question.
