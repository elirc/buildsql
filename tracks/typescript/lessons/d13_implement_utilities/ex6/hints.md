## Hint 1

One conditional with `infer` unwraps one promise layer. The gate feeds you a
promise *inside* a promise - what do you do with the value you just inferred?

## Hint 2

Name the alias in its own true branch: `T extends Promise<infer V> ?
MyAwaited<V> : T`. Recursion keeps unwrapping until the `extends` stops
matching, and the false branch is what passes plain values through.
