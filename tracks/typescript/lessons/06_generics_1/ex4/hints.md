## Hint 1

You wrote this function in lesson 01 with `string` and `number` baked in. The
behaviour has not changed at all; only the two concrete types need to become
parameters.

Name them for what they are - two independent element types.

## Hint 2

```ts
function zipPairs<A, B>(a: readonly A[], b: readonly B[]): [A, B][] { ... }
```

Everything else is lesson 01: stop at the shorter length, push a two-slot tuple
each time, and annotate the accumulator so `push` checks the tuples you build.

## Hint 3

Two type parameters, `readonly A[]` and `readonly B[]` in, `[A, B][]` out.
`Math.min` on the lengths, an indexed loop, `pairs.push([a[i], b[i]])`.

Left to you: whether the accumulator is `[A, B][]` or `Array<[A, B]>`. They are
the same type - and one of the two is much easier to read when the element
type gets long.
