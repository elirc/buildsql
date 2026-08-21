## Hint 1

Three requirements, and they pull against each other:

1. two overlapping `get`s for one key call the loader once,
2. a key that has finished loading never calls the loader again,
3. a key whose load *failed* is forgotten, so the next `get` retries.

Requirement 1 decides your data structure. If you cache the resolved value you
have nothing to hand the second caller while the first load is still in
flight, so cache something that exists earlier than the value does.

## Hint 2

Cache the promise, not the value. A `Map<string, Promise<T>>` satisfies (1)
and (2) at once: `get` looks the key up, returns the stored promise if there
is one, and otherwise calls `load(key)`, stores the promise it got back and
returns it. Promises are freely shareable - awaiting one twice is fine, and
every awaiter of a settled promise gets the same result.

Requirement 3 needs a second step: attach a rejection handler to the promise
you stored that removes the entry from the map. Do that *without* changing
what `get` hands back - the caller still has to see the rejection.

## Hint 3

The skeleton:

```ts
const entries = new Map<string, Promise<T>>();

get(key) {
  const cached = entries.get(key);
  if (cached !== undefined) return cached;

  const pending = load(key);
  entries.set(key, pending);
  pending.catch(() => { /* remove the entry - but which one? */ });
  return pending;
}
```

Two decisions left. Inside the `catch`, delete only if the stored promise is
still *this* one (a retry may already have replaced it) - compare before you
delete. And note that `pending.catch(...)` returns a *new* promise: if you
return that instead of `pending`, you have just swallowed the error you were
told to propagate.
