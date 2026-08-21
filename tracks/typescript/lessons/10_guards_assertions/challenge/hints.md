## Hint 1

Two halves. The type `Validated<T>` needs its failure variant - lesson 04's
`Result` in generic clothing. The function then has to report *every* problem it
found, not stop at the first one, which is the difference between a validator
and a guard.

The error strings and their order are in the README, and the gate compares them
exactly.

## Hint 2

```ts
export type Validated<T> = { ok: true; value: T } | { ok: false; errors: string[] };
```

For the body: reject non-objects up front with the single `expected an object`
error. Otherwise collect into a `string[]`, checking each member in the order
the README lists, and return the failure variant when the array is not empty.

Building the success value needs a few casts - you have proved each member's
type with `typeof`, but you proved it about a `Record<string, unknown>`, and the
compiler does not carry that across into a new object literal.

## Hint 3

Finish the union, then: guard the non-object case, cast to
`Record<string, unknown>`, push one message per bad member, return
`{ ok: false, errors }` if any, otherwise `{ ok: true, value: { ... } }` with
the three members cast to their checked types.

Left to you: whether to write three small type guards and reuse them instead of
three inline `typeof` checks. That version is longer here and much shorter by
the time there are ten fields - which is exactly the moment most teams reach
for `zod` and let a library own this code.
