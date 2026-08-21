## Hint 1

Three behaviours, and they are easiest to write in this order: refuse a
nonsense `attempts`, return the first successful call, and - if every call
threw - rethrow the error from the *last* attempt rather than inventing a new
one.

The gate counts how many times your `action` runs, so an off-by-one shows up
immediately.

## Hint 2

A `try`/`catch` inside a loop is the shape:

```ts
for (let i = 0; i < attempts; i++) {
  try {
    return action();
  } catch (error) {
    // remember it and keep going
  }
}
```

`return` inside `try` exits the loop and the function, so no success flag is
needed. Under this course's `useUnknownInCatchVariables`, `error` is `unknown`,
so store it in a variable typed `unknown` and rethrow it untouched.

## Hint 3

Guard `attempts < 1` first and throw an `Error` whose message is exactly
`retry: attempts must be at least 1`. Then loop, returning on success and
remembering the caught value. After the loop, throw the remembered value.

The `never` part: write the guard's throw as a small helper -
`function fail(message: string): never { throw new Error(message); }` - and
notice that TypeScript still accepts your function as returning `string`,
because a call to a `never`-returning function ends that code path. Whether
you use the helper or throw inline is your call; the gate cannot tell, but the
reading explains why one of them scales.
