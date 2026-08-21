## Hint 1
Two defences, and they are not the same defence. The debounce decides *how
often* you ask. The guard decides *whether you listen* to an answer that
arrives after you have moved on. A component with only the first still shows the
wrong results when the network is uneven.

## Hint 2
Both live in one effect. Schedule the request with `setTimeout`; declare a
`let current = true` beside it; check that flag before setting state; and have
the cleanup clear the timer *and* flip the flag. The delay here is 200ms.

## Hint 3
Remember the empty-query case — an empty filter box should show nothing rather
than the last search's leftovers, and should not send a request at all. Then
answer the follow-up in your head: if debouncing already reduces the number of
requests, why is the guard still necessary?
