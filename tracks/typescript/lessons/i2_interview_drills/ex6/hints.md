## Hint 1

`pipe(2, double, toLabel)` should be typed by following the chain: the first
function's output is the second's input, and the last one's output is the
result. A single generic signature cannot express that, because the number of
steps varies.

The tool for "one function, several contracts" is the one from lesson 02.

## Hint 2

Write overload signatures for one, two and three functions:

```ts
export function pipe<A, B>(value: A, ab: (input: A) => B): B;
export function pipe<A, B, C>(value: A, ab: (input: A) => B, bc: (input: B) => C): C;
```

Each one threads the type parameters through, which is what makes the middle
callbacks contextually typed at the call site. Then one implementation
signature, loose enough to cover them all, with a `reduce` body.

## Hint 3

Three overloads (two, three and four arguments), then
`export function pipe(value: unknown, ...fns: ((input: unknown) => unknown)[]): unknown`
whose body is `fns.reduce((current, fn) => fn(current), value)`.

Left to you: the implementation signature is invisible to callers, and
TypeScript checks it only loosely against the overloads - so the overloads are a
promise you are making. Being able to say that is the point of the drill.
