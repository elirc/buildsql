## Hint 1

State in the closure: the cursor to fetch next, whether the last page has been
seen, and whether a fetch is in flight right now. `read()` starts a fetch,
pushes the page's items when it lands, and pushes `null` after the page whose
`next` was null.

## Hint 2

Two traps, both about `read()` being called at awkward moments:

- it can be called again while your fetch is still pending. Without an
  `inFlight` guard you fetch the same cursor twice and the gate's cursor log
  shows the duplicate;
- the default object-mode `highWaterMark` of 16 makes the machinery keep
  calling `read()` to fill its buffer, which for two-item pages means fetching
  most of the API before the consumer has asked for anything. Pass
  `highWaterMark: 1` so demand, not buffering, drives the fetches.

A rejected fetch is `this.destroy(error)` — not a swallowed catch, and not an
`end`, which would present a failed download as a short one.
