## Hint 1

Read the signature slowly: `promisifyOne` takes a function and returns a
*function*. Nothing async happens while `promisifyOne` runs - it only builds
the wrapper. The work happens later, when someone calls the wrapper.

So the body of `promisifyOne` is a single `return` of an arrow function, and
everything interesting lives inside that arrow function.

## Hint 2

Inside the wrapper you need to produce a promise whose fate is decided by a
callback that will be invoked later. That is exactly what the `Promise`
constructor is for:

```ts
return new Promise<T>((resolve, reject) => {
  // call fn here, and pass it a callback that calls resolve or reject
});
```

The callback you hand to `fn` receives `(error, value)`. The error-first
convention says: if the first argument is truthy, the call failed. Map that
to `reject`; map the other case to `resolve`.

## Hint 3

The shape:

```ts
return (arg: A) =>
  new Promise<T>((resolve, reject) => {
    fn(arg, (error, value) => {
      if (/* which condition? */) reject(error);
      else resolve(value as T);
    });
  });
```

Two decisions left: the condition that distinguishes failure from success, and
whether you need the `as T`. TypeScript types the callback's value as
`T | undefined` because the convention allows it to be absent on error - the
cast is you telling the compiler what the convention guarantees on the success
path. If that makes you uneasy, good: `node:util`'s real `promisify` has the
same problem and solves it with overloads.
