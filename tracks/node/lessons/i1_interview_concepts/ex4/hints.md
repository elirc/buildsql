## Hint 1

`loadCached` is lesson 01 ex2 again: build a `require` with
`createRequire(import.meta.url)` and call it. The point of the exercise is
that calling it twice does **not** run the module twice - the second call is a
lookup in a cache keyed by resolved filename.

`loadFresh` has to remove that cache entry first. Two functions do the work,
and both hang off the `require` you built.

## Hint 2

```ts
require.resolve("./counter.cjs");   // the absolute filename - the cache KEY
require.cache;                      // the cache itself: filename -> module record
```

So busting it is `delete require.cache[require.resolve(specifier)]` followed
by an ordinary `require`. Resolve rather than guessing the path: the key is
the resolved absolute filename, and a relative string will never match it.

Note this only works for CommonJS. ESM's registry is not exposed and there is
no supported way to unload a module - which is why test runners like vitest
give each test *file* a fresh registry rather than trying to evict modules.

## Hint 3

```ts
const require = createRequire(import.meta.url);
const SPECIFIER = "./counter.cjs";

export function loadFresh(): CounterModule {
  /* delete one entry, then require */
}
```

The decision left to you is the exact cache key. Then think about what the
gate proves next: after a fresh load, `loadCached()` returns the *new*
instance, because the fresh require repopulated the cache. That is the reason
this trick is a footgun in production - every part of your program still
holding the old exports keeps them forever, and you now have two versions of
one module in the same process.
