## Hint 1

Two independent type parameters, one for each task, and a tuple out - the same
shape as lesson 06's `zipPairs`, but with promises in the middle.

The runtime half is the part people get wrong in interviews: starting the second
task only after the first has finished is *sequential*, and the gate can see the
difference.

## Hint 2

```ts
const [first, second] = await Promise.all([taskA(), taskB()]);
```

`Promise.all` on a tuple of promises resolves to a tuple of their values, in
order, and TypeScript models that precisely - which is why the return type can
be `Promise<[A, B]>` with no cast.

Both calls happen on the same line, so both are in flight before either is
awaited. `await a(); await b();` does not do that.

## Hint 3

Signature: `bothOf<A, B>(a: () => Promise<A>, b: () => Promise<B>): Promise<[A, B]>`.
Body: `return Promise.all([a(), b()]);` inside an `async` function.

Left to you: what should happen when one of the two rejects. `Promise.all`
rejects as soon as any input does, and the other task keeps running with nobody
listening. `Promise.allSettled` is the alternative - knowing which one you want
is the actual skill.
