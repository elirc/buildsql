## Hint 1

`Promise.allSettled` is the one that never rejects. Its result is an array of a
discriminated union: `{ status: "fulfilled"; value: T }` or
`{ status: "rejected"; reason: any }`.

## Hint 2

Narrow on `status` before reading `value` or `reason` - that is the same
discriminated-union narrowing as lesson 04, applied to a type from the standard
library.

The reason is typed `any` in `lib.d.ts`; the prompt asks for `unknown` in your
result, which is the honest version.

Left to you: one pass with a loop, or two `filter` passes with predicates. The
loop is the d09 argument again; both are correct here.
