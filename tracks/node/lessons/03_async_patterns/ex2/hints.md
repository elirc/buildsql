## Hint 1

Two requirements are hiding in this prompt, and they need different tools.

"One task failing must not lose the others" rules out `Promise.all`, which
rejects the moment anything rejects and discards everything else. There is a
sibling combinator whose whole purpose is "tell me how all of them went".

"Every task must be started before you wait for any of them" is about where
you call the task functions. You were handed functions, not promises: nothing
is running until you call them.

## Hint 2

Start them all in one go by mapping over the array - `tasks.map((task) =>
task())` gives you an array of promises, all of them already in flight - and
hand that array to `Promise.allSettled`.

What comes back is an array of records in input order, each one either
`{ status: "fulfilled", value }` or `{ status: "rejected", reason }`. Walk it
once and push into the two output arrays. Because you walk it in order, the
"input order" requirement comes for free.

## Hint 3

The shape:

```ts
const outcomes = await Promise.allSettled(tasks.map((task) => task()));

const ok: T[] = [];
const failed: string[] = [];
for (const outcome of outcomes) {
  if (outcome.status === /* which literal? */) ok.push(outcome.value);
  else failed.push(/* the message, not the error object */);
}
return { ok, failed };
```

Two decisions left: the string TypeScript narrows the union on, and how you
get a *message* out of a `reason` that is typed `any`. The gate rejects with
real `Error` objects, so `reason.message` is there - but a defensive
`instanceof Error` check is what you would write in production, because
anything at all can be thrown in JavaScript.
