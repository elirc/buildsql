## Hint 1

Two independent problems.

`Loaded` is currently the promise. You want what the promise resolves to, and
there is a utility type whose whole job is unwrapping that - it also handles a
plainly non-promise type, and nested promises, without complaint.

`once` is a *higher-order* function: it takes a function and returns a
function. Its signature should say that the returned function has the same
parameters and the same result as the one it was given.

## Hint 2

`Awaited<T>` unwraps a promise; `ReturnType<F>` and `Parameters<F>` read a
function type apart.

The signature to build:

```ts
function once<F extends (...args: any[]) => any>(
  fn: F,
): (...args: Parameters<F>) => ReturnType<F> { ... }
```

Yes, `any` in that constraint - it is the one position where the community
agrees `any` is right, because the constraint is only saying "some function".
The reading explains why `unknown` does not work there.

For the body: a closure with a `called` flag and a cached `result`.

## Hint 3

`Loaded` is `Awaited<ReturnType<Loader>>`. `once` is the signature above, with
a body that returns an arrow capturing two variables - a boolean and the cached
result - and calls `fn` only when the boolean is still false.

Left to you: what happens when the wrapped function is called again with
*different* arguments. This version ignores them and returns the first result;
a memoiser would key on the arguments instead. The name you would give each of
those is the whole difference.
