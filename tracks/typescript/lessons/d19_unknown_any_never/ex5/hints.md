## Hint 1

Key remapping (d14 ex4, ex5) is the tool: `[K in keyof T as <new key>]`. A
remap that produces `never` deletes the member.

## Hint 2

So the new key is a conditional: `never` when the member's type is `never`, and
`K` otherwise. Note which way round that is - it is easy to write the branches
backwards and delete everything else instead.

Left to you: whether the check should be `T[K] extends never` or
`[T[K]] extends [never]`. Both pass this gate; d15 ex6 explains when they part
company, and it is worth deciding on purpose.
