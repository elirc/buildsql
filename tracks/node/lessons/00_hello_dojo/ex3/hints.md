## Hint 1

You are handed an array of promises, not an array of numbers. Adding promises
together gives you `"[object Promise][object Promise]"`, which is exactly the
kind of failure the gate is looking for.

So the job splits in two: turn the array of promises into an array of numbers,
then add the numbers up — and you already wrote the adding-up half in ex2.

## Hint 2

`Promise.all(promises)` returns a single promise that resolves to an array of
the resolved values, in input order. `await` it inside your `async` function
and you are back in familiar territory.

The rejection case needs no code at all: `Promise.all` rejects with the first
rejection it sees, and an `await` on a rejected promise throws inside your
function, which turns into a rejection of the promise your function returns.
Do not wrap it in `try`/`catch` — the gate wants that error to escape.

## Hint 3

The shape is two statements:

```ts
const values = await /* what combinator? */;
return values.reduce(/* the same reducer idea as ex2 */);
```

The decision left to you is the reducer and its initial value. Check the empty
array case: `Promise.all([])` resolves immediately to `[]`, so the answer
comes entirely from where your sum starts.
