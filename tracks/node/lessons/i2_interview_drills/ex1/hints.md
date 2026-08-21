## Hint 1

Say the specification back first, because that is what the interviewer is
listening for: one record per input, in input order, and the returned promise
**never rejects** - a rejection becomes a record, not a failure.

That last clause is the whole trick. If you can turn every input promise into
one that always fulfils, you are back to a problem you already know how to
solve.

## Hint 2

`promise.then(onFulfilled, onRejected)` takes *two* callbacks. The second one
catches the rejection and its return value becomes the fulfilment value of the
new promise:

```ts
promise.then(
  (value) => ({ status: "fulfilled", value }),
  (reason) => ({ status: "rejected", reason }),
);
```

That promise cannot reject. Map every input through it and hand the array to
`Promise.all`, which now has nothing to fail on. Input order comes for free,
because `all` preserves it.

## Hint 3

```ts
return Promise.all(
  promises.map((promise) =>
    promise.then(
      /* the fulfilled shape */,
      /* the rejected shape */,
    ),
  ),
);
```

Two decisions left: the two record shapes (they are a discriminated union -
`status` is what distinguishes them). Note the two-argument `then` rather than
`.then().catch()`: chaining a `catch` after a `then` would also catch an error
thrown *by your own success handler*, which is a subtly different program.
Be ready to say that out loud - it is the follow-up.

The counting version - a results array, a done counter, and a manual `resolve`
when the counter reaches the length - is also a fine answer, and worth
mentioning as the way you would do it without `Promise.all`.
