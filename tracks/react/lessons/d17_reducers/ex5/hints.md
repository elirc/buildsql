## Hint 1

Immutability goes all the way down. The stub copies the array and then reaches
into it and edits one of the objects the caller is still holding — a fresh
array of the same stale rows.

## Hint 2

`map` over the tickets and return a **copy** of the one that matched and the
**original** for everything else. Returning a copy of every row would also
work, and would quietly defeat any memoization further down the tree.

## Hint 3

The `default` branch is the second bug. Once the switch covers the whole union
TypeScript treats `action` there as `never`, which is a good hint about what
reaching it means — say so out loud, with the type that arrived in the message.
