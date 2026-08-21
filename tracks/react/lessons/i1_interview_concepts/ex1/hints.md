## Hint 1
Before you touch anything, be able to say what is wrong. The interval is
created once, on mount. The function it was given was created during that same
render. What is `count` worth inside that function, on the tenth tick?

## Hint 2
Still `0` — it was baked in when the closure was created, and the effect never
re-runs to make a new one. So every tick calls `setCount(0 + 1)`, state goes to
`1`, and React bails out of the next identical update. That is a **stale
closure**.

## Hint 3
Two fixes exist and only one is good. Adding `count` to the dependency array
gives the effect a fresh closure each second, at the cost of tearing down and
recreating the timer every tick, which drifts. The better fix stops the callback
reading `count` at all — it describes the change instead of computing from a
captured value — and it is one word long.
