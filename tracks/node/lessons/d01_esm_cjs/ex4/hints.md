## Hint 1

`require()` is memoised. The key is not the specifier you typed, it is the
*resolved absolute filename* — which is why two different relative specifiers
pointing at the same file share one entry. `sharedRegistry()` therefore needs
no caching of its own: just require it and return.

## Hint 2

The cache is an ordinary object hanging off the require function, keyed by that
resolved filename. Two pieces fit together:

```ts
require.resolve("./registry.cjs"); // the key
require.cache;                     // the object it is a key of
```

Delete the entry, then require again. Note what that means for the object you
handed out a moment ago — nobody rewrites it, it simply stops being the one the
cache will serve, which is exactly what the gate checks last.
