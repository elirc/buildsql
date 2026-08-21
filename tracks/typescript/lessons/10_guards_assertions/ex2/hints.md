## Hint 1

A type guard answers a question. An assertion *insists*: either the value is
what you say, or the function throws and execution never continues. After the
call, the compiler treats the value as narrowed for the rest of the scope - no
`if` needed.

Everything about the runtime behaviour is in the README, including the exact
message.

## Hint 2

The return type is a clause rather than a type:

```ts
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") throw new Error("not a number");
}
```

Two rules that catch everyone. The function must be a `function` declaration or
have an explicit type annotation - TypeScript refuses to infer an assertion
signature for `const f = (v: unknown) => { ... }`. And the function must throw on
failure; returning normally would make the assertion a lie.

`Array.isArray` plus a check of every element is the body.

## Hint 3

Signature: `assertIsStringArray(value: unknown): asserts value is string[]`.
Body: if it is not an array, or any element is not a string, throw an `Error`
whose message is exactly `expected an array of strings`.

Left to you: an empty array passes, because every one of its zero elements is a
string. If that is wrong for your use case the fix is a separate check - and
noticing that `[].every(...)` is `true` has saved more than one production
outage.
