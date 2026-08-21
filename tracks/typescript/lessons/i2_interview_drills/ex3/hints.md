## Hint 1

Two halves, and they are independent. `Promisified<F>` is a *type* that takes a
callback-style function type and produces the promise-returning version of it -
which means pattern-matching the callback's payload out of the signature.
`promisify` is the runtime wrapper.

Do the runtime half first if the type half stalls; the gate grades them
separately.

## Hint 2

For the type: a conditional with `infer` is how you pull `T` out of
`(callback: Callback<T>) => void`. The stub's `Promisified<T>` takes the wrong
thing - it should take the *function* type, not the payload.

For the function: return an arrow that returns `new Promise<T>((resolve,
reject) => ...)`, and inside, call `fn` with a callback that rejects on a
non-null error and resolves otherwise.

## Hint 3

```ts
export type Promisified<F> = F extends (callback: Callback<infer T>) => void
  ? () => Promise<T>
  : never;
```

The wrapper resolves with `value as T` - the error-first convention means the
value is only meaningful when the error is null, and the optional `value?` in
the callback type is what forces that cast.

Left to you: what to do when a buggy callback fires twice. A promise ignores the
second settle, which is either a feature or a silently swallowed bug - worth
saying out loud.
