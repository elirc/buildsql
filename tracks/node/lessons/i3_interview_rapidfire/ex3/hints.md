## Hint 1

Race the work against a promise that rejects on a timer, and clean the timer
up afterwards - on every path, including the one where the work rejected.

You wrote this in lesson 03. The two additions here: the rejection carries
`code: "ETIMEDOUT"` as well as the message, and the gate checks the timer
count once the race is over.

## Hint 2

```ts
let timer: ReturnType<typeof setTimeout> | undefined;
const deadline = new Promise<never>((_resolve, reject) => {
  timer = setTimeout(() => reject(/* an Error with a code */), ms);
});

try {
  return await Promise.race([promise, deadline]);
} finally {
  clearTimeout(timer);
}
```

`Object.assign(new Error(message), { code: "ETIMEDOUT" })` is the compact way
to tag an error - the same convention Node uses for `ENOENT` and friends, so
callers branch on the code rather than the prose.

## Hint 3

The decision left to you is the `await` in `return await`. Without it the
function hands back the racing promise immediately and `finally` runs at once,
clearing the timer before it can ever fire - so nothing ever times out. Inside
`try`/`finally`, `return await` is load-bearing, and it is the one place a
linter that flags it as redundant is wrong.

Say the caveat out loud when you finish: racing does not cancel. The slow work
is still running; if you need it stopped, pass an `AbortSignal`.
