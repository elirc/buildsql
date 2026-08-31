## Hint 1

Two topics: async typing (d21) and generic wrappers (d09). The tasks are
*factories* - `() => Promise<T>` - which is what makes "the third is never
called" possible; an array of promises would already be running.

## Hint 2

`return await task()` inside the `try`, so a rejection is caught here rather
than at the caller. Without the `await` the promise escapes the `try` and the
loop ends after one iteration.

## Hint 3

The empty case needs its own error, because there is no last rejection to
rethrow. Handling it first keeps the loop honest.

Left to you: `Promise.any` does something similar and differently - it starts
everything at once and rejects with an `AggregateError`. Read its page and
decide which of the two you would actually want.
