## Hint 1

`Promise.race` settles with whichever input settles first, rejection included.
That is what gives you "the task rejected first, so its reason wins" without
any extra code.

## Hint 2

Turn the expiry into a promise that *rejects*: `expire.then(() => { throw ... })`.
Its type is `Promise<never>`, which is why racing it against `Promise<T>` still
gives `Promise<T>` - `T | never` is `T`.

Left to you: whether this function should also stop the task when the timeout
wins. It cannot, and that is worth sitting with: a promise has no cancel, and
the abort signal is a separate mechanism.
