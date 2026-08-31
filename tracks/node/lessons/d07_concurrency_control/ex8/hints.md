## Hint 1

Start from ex5's pool: `limit` runners, a shared cursor, results by index. Then
add cancellation in three places, because "abortable" means three different
things and the gate checks each one.

1. Before anything starts: if `signal.aborted` already, throw `signal.reason`.
2. In the runner's loop condition: stop claiming new indexes once aborted.
3. In the return: reject as soon as the abort happens, rather than after the
   in-flight work finishes.

## Hint 2

The third one needs a promise that rejects on the abort event:

```ts
const aborted = new Promise<never>((_, reject) => {
  signal.addEventListener("abort", () => reject(signal.reason), { once: true });
});
```

Then `Promise.race([Promise.all(runners), aborted])`. On the happy path that
promise simply never settles — which is fine, and is also why it needs a
`.catch(() => {})` of its own so an abort with nobody racing it is not an
unhandled rejection.

## Hint 3

Two details separate this from a version that passes today and leaks tomorrow.

Remove the abort listener when you are done. A long-lived `AbortSignal` — a
request signal, say — accumulates one listener per call, and at eleven of them
Node starts printing `MaxListenersExceededWarning`.

And pass the signal to the worker. A limiter that only stops *scheduling* leaves
the requests already in flight running to completion, which is not what the user
who pressed cancel meant. What the worker does with it is its business; your
job is to hand it over.

The remaining decision is what to do with the results collected before the
abort. This version throws them away; an alternative returns the partial array.
Be able to say which one a caller would rather have.
