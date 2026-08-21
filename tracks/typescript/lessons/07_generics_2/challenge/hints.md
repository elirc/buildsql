## Hint 1

Three type parameters, and the third one depends on the second. Say the shape
out loud: `K1` is a key of the object, and `K2` is a key of *whatever lives at
that key*.

The body is one expression. All the work is in the signature.

## Hint 2

Constraints may refer to earlier type parameters:

```ts
function twoDeep<T, A extends keyof T, B extends keyof T[A]>(...)
```

`T[A]` is the type at the first key, so `keyof T[A]` is the set of keys valid
for the second. That is what makes `getIn(config, "server", "colour")` a
compile error naming the keys it *would* have accepted.

The return type follows the same chain: `T[A][B]`.

## Hint 3

Signature: `getIn<T, K1 extends keyof T, K2 extends keyof T[K1]>(source: T, first: K1, second: K2): T[K1][K2]`,
body `return source[first][second];`.

Left to you: what this function should do if the intermediate value is
`undefined` at runtime. The types say it cannot be - but the types came from
the caller, and lesson 10 is about what to do when you do not trust them.
