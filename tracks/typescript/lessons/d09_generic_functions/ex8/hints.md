## Hint 1

`TreeNode<unknown>[]` throws the row type away at the last step. Return
`TreeNode<T>[]`, and the two callbacks will keep everything else honest.

## Hint 2

Two passes, both linear. First build a `Map` from id to a fresh childless node.
Then walk the items again in order and attach each node either to its parent's
`children` or, if the parent id is `null` **or is not in the map**, to the roots.

Walking the original list in the second pass is what preserves input order in
both places.

Left to you: what to do about a duplicate id. The prompt does not say, and a
`Map` quietly keeps the last one - decide whether that is acceptable and be able
to say so.
