## Hint 1

Constrain the inner key to the keys of whatever lives at the outer one:

```ts
I extends keyof T[K]
```

Then the element type of the result is `T[K][I]`, and the array type is that
followed by `[]`.

## Hint 2

The body is one `map` of `item[outer][inner]`. If it does not compile, the
signature is wrong - not the body.

A common near-miss is `I extends keyof T`, which accepts the outer keys and
rejects every inner one.

Left to you: whether to guard against a missing intermediate object. The types
say it cannot happen; data from a network does not read types.
