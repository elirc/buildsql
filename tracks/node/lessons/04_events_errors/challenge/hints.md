## Hint 1

The data structure is a `Map<string, Listener[]>`: event name to the listeners
registered for it, in registration order. `on` appends, `off` removes by
identity, `emit` walks the array.

Write those three first and get the ordering and the `false`-when-empty rule
passing. Then come back for `once`, which is where the design decisions are.

## Hint 2

Two rules are easy to get subtly wrong.

**`emit` must iterate over a copy.** A listener is allowed to call `off` (or
`on`) while it runs, and if you are walking the live array, removing the
current element shifts everything down and the next listener gets skipped.
`for (const listener of [...existing])` costs nothing and fixes it.

**`once` needs a wrapper**, because the thing that has to be removed is not
the listener the caller gave you - it is your wrapper. So `off(event,
originalListener)` has to be able to find the wrapper. A second map from
original to wrapper is the simplest way.

## Hint 3

The shape of `once`:

```ts
once(event, listener) {
  const wrapper: Listener = (...args) => {
    /* remove the wrapper FIRST, then call the listener */
  };
  wrappers.set(listener, wrapper);
  emitter.on(event, wrapper);
}
```

Two decisions left. The order inside the wrapper matters: if the listener
throws, having already removed it means it still only ran once. And in `off`,
you have to look for the wrapper *before* falling back to the listener itself
(`wrappers.get(listener) ?? listener`), or `off` will silently do nothing for
every `once` listener - the bug that turns a one-shot handler into a permanent
one.
