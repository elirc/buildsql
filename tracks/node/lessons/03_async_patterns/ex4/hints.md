## Hint 1

"Whichever happens first" is a combinator: `Promise.race` settles as soon as
any of its inputs settles, with that input's value or reason. So you need a
second promise that rejects when the deadline passes, and a race between it
and the work.

The second half of the exercise is the part the gate is strict about: after
the race is over, the timer must not still be pending.

## Hint 2

Build the deadline with the `Promise` constructor so you can capture the timer
handle:

```ts
let timer: ReturnType<typeof setTimeout> | undefined;
const deadline = new Promise<never>((_resolve, reject) => {
  timer = setTimeout(() => reject(new Error(message)), ms);
});
```

`Promise<never>` is the honest type: this promise can only ever reject.

Then race, and clear the timer afterwards - on *every* path, including the one
where the work rejected. `try`/`finally` around the race is the shape that
gets all three paths right at once.

## Hint 3

```ts
try {
  return await /* race what against what? */;
} finally {
  clearTimeout(timer);
}
```

The decision left to you is the `await` in front of the race. Without it, the
function returns the promise and the `finally` runs *immediately* - clearing
the timer before it ever had a chance to fire, so nothing ever times out.
`return await` inside `try`/`finally` is the one place where the "redundant
await" your linter complains about is load-bearing.
